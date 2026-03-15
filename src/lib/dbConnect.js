import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

/** * Global is used here to maintain a cached connection across hot reloads 
 * in development. This prevents connections from growing exponentially.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local (or in your hosting provider\'s environment settings).'
        );
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,   // 5s to select a server (default was 30s!)
            connectTimeoutMS: 10000,          // 10s to establish connection
            socketTimeoutMS: 45000,           // 45s socket timeout
            maxPoolSize: 10,                  // Connection pool
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { dbConnect, cloudinary };