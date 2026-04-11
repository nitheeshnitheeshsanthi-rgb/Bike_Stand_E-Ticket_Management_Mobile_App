const mongoose = require('mongoose');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📡 Connected to MongoDB');

    // First, clear any existing users with this email (all roles) to avoid conflicts
    await User.deleteMany({ email: 'akumar@aparna.io' });
    console.log('🧹 Cleared existing accounts for akumar@aparna.io');

    // Create the fresh staff account
    const admin = new User({ 
      name: 'kumar',
      email: 'akumar@aparna.io',
      password: 'admin123',
      role: 'staff',
      username: 'kumar_owner',
      phone: '9999999999'
    });
    
    await admin.save();
    console.log('✅ Default Staff Created: akumar@aparna.io / admin123');

    const slots = ['A01', 'A02', 'A03', 'A04', 'A05', 'B01', 'B02', 'B03', 'B04', 'B05'];
    for (const slotNum of slots) {
      const exists = await ParkingSlot.findOne({ slotNumber: slotNum });
      if (!exists) await new ParkingSlot({ slotNumber: slotNum }).save();
    }
    console.log('✅ Parking Slots Initialized');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
