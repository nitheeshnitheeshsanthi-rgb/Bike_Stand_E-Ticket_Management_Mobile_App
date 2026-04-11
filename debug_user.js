const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand');
        console.log('Connected');
        
        const user = await User.findOne({ email: 'akumar@aparna.io' });
        if (!user) {
            console.log('USER NOT FOUND');
        } else {
            console.log('User found:', { email: user.email, role: user.role, passwordHash: user.password });
            const match = await bcrypt.compare('admin123', user.password);
            console.log('Password "admin123" matches?', match);
            
            // Try manually hashing and comparing
            const manualHash = await bcrypt.hash('admin123', 10);
            const manualMatch = await bcrypt.compare('admin123', manualHash);
            console.log('Manual hash test:', manualMatch);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
