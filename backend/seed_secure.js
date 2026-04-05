const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const ScanLog = require('./models/ScanLog');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const SECRET_KEY = process.env.QR_SECRET || 'bike_stand_secure_qr_secret_key_2024';

const seedSecureData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create a secure ticket
    const ticketId = uuidv4();
    const issuedAt = Date.now();
    const payload = { ticketId, issuedAt, app: "BikeStandApp" };
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(JSON.stringify(payload)).digest('hex');

    const testTicket = new Ticket({
      ticketId,
      vehicleNumber: 'TEST-1234',
      vehicleType: 'Bike',
      entryTime: new Date(),
      status: 'ACTIVE',
      issuedAt,
      signature,
      qrCodeData: JSON.stringify({ data: payload, sig: signature }),
      createdBy: new mongoose.Types.ObjectId() // Dummy ID for seeding
    });

    await testTicket.save();
    console.log('✅ Created Secure Ticket with new fields (issuedAt, signature, qrCodeData)');

    // 2. Create a scan log
    const log = new ScanLog({
      ticketId,
      scannedBy: new mongoose.Types.ObjectId(),
      result: 'VALID',
      details: 'Automatic seed for database verification'
    });

    await log.save();
    console.log('✅ Created ScanLog collection and first scan entry');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedSecureData();
