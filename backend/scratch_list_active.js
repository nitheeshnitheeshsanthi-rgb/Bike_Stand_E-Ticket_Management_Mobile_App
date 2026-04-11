const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
require('dotenv').config();

const listActive = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bikestand');
        const activeTickets = await Ticket.find({ status: 'ACTIVE' });
        console.log('--- ACTIVE TICKETS ---');
        activeTickets.forEach(t => console.log(`${t.vehicleNumber} (${t.ticketId})` ));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listActive();
