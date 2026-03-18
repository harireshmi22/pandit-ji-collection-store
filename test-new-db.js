import mongoose from 'mongoose';

// Test with your new Gmail-based MongoDB setup
const uri = process.env.MONGODB_URI;

async function testNewConnection() {
    try {
        console.log('Testing new Gmail-based MongoDB connection...');
        console.log('URI:', uri ? 'Found in env' : 'Not found in env');
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log('Connection state:', mongoose.connection.readyState);
        
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        console.log('✅ Ping successful:', result);
        
        await mongoose.connection.close();
        console.log('✅ Connection closed');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
    }
}

testNewConnection();
