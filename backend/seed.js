const mongoose = require('mongoose');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📡 Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@kinetic.io' });
    
    if (!adminExists) {
      console.log('⚙️ Creating new admin user object...');
      const admin = new User({
        name: 'Sri Anna Administrator',
        email: 'admin@kinetic.io',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999'
      });
      await admin.save();
      console.log('✅ Default Admin Created: admin@kinetic.io / admin123');
    } else {
      console.log('ℹ️ Admin account already exists (admin@kinetic.io).');
    }

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
