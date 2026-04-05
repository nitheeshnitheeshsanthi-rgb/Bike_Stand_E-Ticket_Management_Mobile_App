const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand';

const checkDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        console.log(`Connected to: ${mongoose.connection.name}`);
        
        const collections = await db.listCollections().toArray();
        console.log(`Collections in ${mongoose.connection.name}:`, collections.map(c => c.name));
        
        if (collections.some(c => c.name === 'tickets')) {
            const Ticket = require('./models/Ticket');
            const count = await Ticket.countDocuments();
            console.log(`Found ${count} tickets.`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDB();
