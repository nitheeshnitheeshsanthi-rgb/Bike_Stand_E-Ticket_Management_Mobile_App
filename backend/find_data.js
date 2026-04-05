const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = 'mongodb://127.0.0.1:27017'; // Just the port

const listAll = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('--- All Databases on 127.0.0.1:27017 ---');
        console.log(dbs.databases.map(d => d.name));
        
        for (const dbInfo of dbs.databases) {
            const tempConn = mongoose.createConnection(`${MONGO_URI}/${dbInfo.name}`);
            await tempConn.asPromise();
            const collections = await tempConn.db.listCollections().toArray();
            if (collections.length > 0) {
               console.log(`Database: ${dbInfo.name} has collections:`, collections.map(c => c.name));
            }
            await tempConn.close();
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listAll();
