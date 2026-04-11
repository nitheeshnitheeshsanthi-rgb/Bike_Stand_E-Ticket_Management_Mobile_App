const Ticket = require('../models/Ticket');
const ScanLog = require('../models/ScanLog');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const SECRET_KEY = process.env.QR_SECRET || 'bike_stand_secure_qr_secret_key_2024';

const signPayload = (payload) => {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
};

const verifySignature = (payload, receivedSig) => {
  const computedSig = signPayload(payload);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSig, 'hex'),
      Buffer.from(receivedSig, 'hex')
    );
  } catch (e) {
    return false;
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const createEntry = async (req, res) => {
  try {
    const { vehicleNumber, type, whatsappNumber } = req.body;

    // Check if there is already an active ticket for this vehicle
    const existingTicket = await Ticket.findOne({ vehicleNumber: vehicleNumber.toUpperCase(), status: 'ACTIVE' });
    if (existingTicket) {
      return res.status(400).json({ message: `Vehicle ${vehicleNumber.toUpperCase()} already has an active ticket (${existingTicket.ticketId})` });
    }

    const ticketId = 'TKT' + Math.floor(100000 + Math.random() * 900000);
    const issuedAt = Date.now();
    
    const payload = {
      ticketId,
      issuedAt,
      app: "BikeStandApp"
    };

    const signature = signPayload(payload);
    const qrData = JSON.stringify({ data: payload, sig: signature });

    const ticket = new Ticket({
      ticketId,
      vehicleNumber,
      vehicleType: type || 'Bike',
      createdBy: req.user.id,
      whatsappNumber,
      status: 'ACTIVE',
      whatsappStatus: 'PENDING',
      issuedAt,
      signature,
      qrCodeData: qrData
    });

    // Generate PDF
    const doc = new PDFDocument({ size: [300, 500], margin: 20 });
    const fileName = `${ticketId}.pdf`;
    const filePath = path.join(__dirname, '../public/tickets', fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Content
    doc.fontSize(20).text('BIKE STAND TICKET', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Ticket ID: ${ticketId}`);
    doc.text(`Vehicle No: ${vehicleNumber}`);
    doc.text(`Vehicle Type: ${type || 'Bike'}`);
    doc.text(`Entry Time: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Add QR Code to PDF
    const qrBuffer = await QRCode.toBuffer(qrData);
    doc.image(qrBuffer, 75, 180, { width: 150 });

    doc.moveDown(12);
    doc.fontSize(10).text('Scan at exit to settle fee.', { align: 'center' });
    doc.text('Thank you!', { align: 'center' });
    doc.end();

    // Wait for the file to be written
    await new Promise((resolve) => stream.on('finish', resolve));

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    ticket.pdfUrl = `${baseUrl}/tickets/${fileName}`;
    await ticket.save();
    
    // Generate WhatsApp deep link
    // Sanitize phone number (remove non-digits)
    let sanitizedPhone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : '';
    // If it's 10 digits, prepend 91 (India)
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = '91' + sanitizedPhone;
    }

    const message = encodeURIComponent(
      `Your parking ticket is generated.\n` +
      `Ticket ID: ${ticket.ticketId}\n` +
      `Vehicle: ${ticket.vehicleNumber}\n` +
      `Entry Time: ${new Date(ticket.issuedAt).toLocaleTimeString()}\n` +
      `Download PDF: ${ticket.pdfUrl}`
    );
    const whatsappDeepLink = `https://wa.me/${sanitizedPhone}?text=${message}`;

    const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'name');
    
    res.status(201).json({
      ticket: populatedTicket,
      whatsappDeepLink,
      pdfUrl: ticket.pdfUrl
    });
  } catch (err) {
    console.error('Entry Error:', err);
    res.status(500).json({ message: err.message });
  }
};

const sendWhatsapp = async (req, res) => {
  try {
    const { ticketId, phone } = req.body;
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // This is where you'd call Twilio or Meta WhatsApp API
    // For now, we simulate a successful send
    console.log(`Sending WhatsApp to ${phone} for ticket ${ticketId}`);
    
    // Example Twilio Implementation placeholder:
    /*
    const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio SandBox OR Verified No.
      to: `whatsapp:${phone}`,
      body: `Your parking ticket is generated. Ticket ID: ${ticketId}...`
    });
    */

    ticket.whatsappStatus = 'SENT';
    await ticket.save();
    res.json({ success: true, message: 'WhatsApp message status updated' });
  } catch (err) {
    console.error('WhatsApp Error:', err);
    ticket.whatsappStatus = 'FAILED';
    await ticket.save();
    res.status(500).json({ message: 'Failed to send WhatsApp', error: err.message });
  }
};

const getQrCode = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) return res.status(404).send('Ticket not found');

    const QRCode = require('qrcode');
    const qrBuffer = await QRCode.toBuffer(ticket.qrCodeData);
    
    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const scanVerify = async (req, res) => {
  let ticketIdForLog = "UNKNOWN";
  try {
    const { data, sig } = req.body;
    ticketIdForLog = data?.ticketId || "UNKNOWN";

    if (!data || !sig) {
      await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'INVALID_QR', details: 'Missing data or signature' });
      return res.status(400).json({ code: 'INVALID_QR', message: 'Invalid QR format' });
    }

    // 1. Recompute and verify signature (constant-time)
    if (!verifySignature(data, sig)) {
      await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'TAMPERED_QR', details: 'Signature mismatch' });
      return res.status(401).json({ code: 'TAMPERED_QR', message: 'QR code signature mismatch' });
    }

    // 2. Validate payload fields
    if (data.app !== "BikeStandApp" || !data.ticketId) {
       await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'INVALID_QR', details: 'Foreign QR code app name' });
      return res.status(400).json({ code: 'INVALID_QR', message: 'Foreign QR code detected' });
    }

    // 3. Fetch ticket from DB
    const ticket = await Ticket.findOne({ ticketId: data.ticketId }).populate('createdBy', 'name');
    
    if (!ticket) {
      await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'NOT_FOUND', details: 'Ticket not in collection' });
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ticket not found in system' });
    }

    // 4. Check status
    if (ticket.status !== 'ACTIVE') {
      await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'ALREADY_USED', details: `Ticket status is ${ticket.status}` });
      return res.status(400).json({ code: 'ALREADY_USED', message: 'Ticket already closed' });
    }

    // Log success
    await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'VALID', details: 'Successful scan' });

    // Calculate current fee (₹10/hour) for UI display
    const entryTime = new Date(ticket.entryTime);
    const now = new Date();
    const diffMs = now - entryTime;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const estimatedFee = diffHours * 10;

    res.json({
      success: true,
      ticket,
      estimatedFee
    });
  } catch (err) {
    if (ticketIdForLog) {
       await ScanLog.create({ ticketId: ticketIdForLog, scannedBy: req.user.id, result: 'INVALID_QR', details: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const processExit = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ticket not found' });
    }

    if (ticket.status === 'COMPLETED') {
      return res.status(400).json({ code: 'ALREADY_USED', message: 'Ticket already completed' });
    }

    ticket.exitTime = new Date();
    ticket.calculateClosure(); // Updates duration, fee, and status to COMPLETED
    ticket.paymentStatus = 'PAID';
    
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const query = vehicleNumber ? { vehicleNumber: new RegExp(vehicleNumber, 'i') } : {};
    const tickets = await Ticket.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalVehicles = await Ticket.countDocuments({ createdAt: { $gte: startOfDay } });
    const revenueStats = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: 'COMPLETED', paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);

    res.json({
      totalVehiclesToday: totalVehicles,
      revenueToday: revenueStats.length > 0 ? revenueStats[0].total : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTicket = async (req, res) => {
  try {
    const searchId = req.params.id;
    // Search by TicketId or VehicleNumber (case-insensitive for vehicle number)
    const ticket = await Ticket.findOne({
      $or: [
        { ticketId: searchId },
        { vehicleNumber: { $regex: new RegExp('^' + searchId + '$', 'i') } }
      ],
      status: 'ACTIVE' // Only fetch active tickets for exit processing
    }).populate('createdBy', 'name');

    if (!ticket) return res.status(404).json({ message: 'No active ticket found for this ID or Vehicle Number' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEntry,
  scanVerify,
  processExit,
  getHistory,
  getDashboardStats,
  sendWhatsapp,
  getQrCode,
  getTicket
};
