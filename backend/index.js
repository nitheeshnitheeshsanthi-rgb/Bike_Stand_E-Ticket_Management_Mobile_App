const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Ticket = require('./models/Ticket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/tickets', express.static(path.join(__dirname, 'public/tickets')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);

// Home Page (Option for Staff or Rider)
app.get('/', (req, res) => {
  res.render('home');
});

// Staff Portal (Web Generator)
app.get('/staff', (req, res) => {
  res.render('staff_portal');
});

// Helper for generating tickets via web portal (bypassing JWT header for preview)
app.post('/api/tickets/web-entry', async (req, res) => {
  try {
    const { vehicleNumber, type, whatsappNumber } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const crypto = require('crypto');
    const SECRET_KEY = process.env.QR_SECRET || 'bike_stand_secure_qr_secret_key_2024';
    
    const ticketId = 'BST-' + Math.floor(1000 + Math.random() * 9000); // Friendly ID for web
    const issuedAt = Date.now();
    
    const payload = {
      ticketId,
      issuedAt,
      app: "SriAnnaApp"
    };

    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    const ticket = new Ticket({
      ticketId,
      vehicleNumber,
      vehicleType: type || 'Bike',
      createdBy: '69c15e170878458f2357f143', // Fixed mock staff ID
      whatsappNumber,
      status: 'ACTIVE',
      whatsappStatus: 'PENDING',
      issuedAt,
      signature,
      qrCodeData: JSON.stringify({ data: payload, sig: signature })
    });

    await ticket.save();
    
    // Auto-trigger WhatsApp simulation
    console.log(`Web Portal: Sending WhatsApp to ${whatsappNumber} for ticket ${ticketId}`);
    ticket.whatsappStatus = 'SENT';
    await ticket.save();

    res.status(201).json({ ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public Ticket Preview (No Auth Required)
app.get('/preview/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });
    if (!ticket) return res.status(404).send('Ticket not found');
    res.render('ticket', { ticket });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Admin Preview Dashboard (No Auth for this preview)
app.get('/admin-preview', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const totalVehiclesToday = await Ticket.countDocuments({ createdAt: { $gte: startOfDay } });
    const revenue = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);
    const stats = {
      totalVehiclesToday,
      revenueToday: revenue.length > 0 ? revenue[0].total : 0
    };
    res.render('dashboard', { stats });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
