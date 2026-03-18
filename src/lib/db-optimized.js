<<<<<<< HEAD
import mongoose from 'mongoose';
import { redisHelpers } from './redis.js';

// Connection state management
let connectionPromise = null;
let isConnected = false;

// Optimized database connection with connection pooling
export async function dbConnect() {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      const options = {
        // Connection pooling settings
        maxPoolSize: 10, // Maximum number of sockets in the connection pool
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server before giving up
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        
        // Performance optimizations
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
        // Retry settings
        retryWrites: true,
        retryReads: true,
        readPreference: 'primary',
        writeConcern: {
          w: 'majority',
          j: true
        }
      };

      mongoose.connect(process.env.MONGODB_URI, options);

      mongoose.connection.on('connected', () => {
        console.log('[DB] MongoDB connected successfully');
        isConnected = true;
        resolve(mongoose.connection);
      });

      mongoose.connection.on('error', (err) => {
        console.error('[DB] MongoDB connection error:', err);
        isConnected = false;
        connectionPromise = null;
        reject(err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('[DB] MongoDB disconnected');
        isConnected = false;
        connectionPromise = null;
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('[DB] MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('[DB] Connection initialization error:', error);
      connectionPromise = null;
      reject(error);
    }
  });

  return connectionPromise;
}

// Cache helper functions for common queries
export const cacheHelper = {
  async getOrSet(key, fetchFunction, ttl = 300) {
    try {
      // Try to get from cache first
      const cached = await redisHelpers.get(key);
      if (cached) {
        console.log(`[CACHE] HIT for key: ${key}`);
        return cached;
      }

      console.log(`[CACHE] MISS for key: ${key}`);
      
      // Cache miss, fetch data
      const data = await fetchFunction();
      
      // Cache the result
      if (data) {
        await redisHelpers.set(key, data, { ex: ttl });
        console.log(`[CACHE] SET for key: ${key} (TTL: ${ttl}s)`);
      }
      
      return data;
    } catch (error) {
      console.error(`[CACHE] Error for key ${key}:`, error);
      // Fallback to direct fetch if cache fails
      return await fetchFunction();
    }
  },

  async invalidate(pattern) {
    try {
      // For simple pattern matching, you might need to implement pattern-based deletion
      // This is a simplified version
      await redisHelpers.del(pattern);
      console.log(`[CACHE] Invalidated key: ${pattern}`);
    } catch (error) {
      console.error(`[CACHE] Invalidation error for ${pattern}:`, error);
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (label) => ({
    start: performance.now(),
    label
  }),

  end: (timer) => {
    const duration = (performance.now() - timer.start).toFixed(2);
    console.log(`[PERF] ${timer.label}: ${duration}ms`);
    return duration;
  }
};

export default dbConnect;
=======
import mongoose from 'mongoose';
import { redisHelpers } from './redis.js';

// Connection state management
let connectionPromise = null;
let isConnected = false;

// Optimized database connection with connection pooling
export async function dbConnect() {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      const options = {
        // Connection pooling settings
        maxPoolSize: 10, // Maximum number of sockets in the connection pool
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server before giving up
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        
        // Performance optimizations
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
        // Retry settings
        retryWrites: true,
        retryReads: true,
        readPreference: 'primary',
        writeConcern: {
          w: 'majority',
          j: true
        }
      };

      mongoose.connect(process.env.MONGODB_URI, options);

      mongoose.connection.on('connected', () => {
        console.log('[DB] MongoDB connected successfully');
        isConnected = true;
        resolve(mongoose.connection);
      });

      mongoose.connection.on('error', (err) => {
        console.error('[DB] MongoDB connection error:', err);
        isConnected = false;
        connectionPromise = null;
        reject(err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('[DB] MongoDB disconnected');
        isConnected = false;
        connectionPromise = null;
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('[DB] MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('[DB] Connection initialization error:', error);
      connectionPromise = null;
      reject(error);
    }
  });

  return connectionPromise;
}

// Cache helper functions for common queries
export const cacheHelper = {
  async getOrSet(key, fetchFunction, ttl = 300) {
    try {
      // Try to get from cache first
      const cached = await redisHelpers.get(key);
      if (cached) {
        console.log(`[CACHE] HIT for key: ${key}`);
        return cached;
      }

      console.log(`[CACHE] MISS for key: ${key}`);
      
      // Cache miss, fetch data
      const data = await fetchFunction();
      
      // Cache the result
      if (data) {
        await redisHelpers.set(key, data, { ex: ttl });
        console.log(`[CACHE] SET for key: ${key} (TTL: ${ttl}s)`);
      }
      
      return data;
    } catch (error) {
      console.error(`[CACHE] Error for key ${key}:`, error);
      // Fallback to direct fetch if cache fails
      return await fetchFunction();
    }
  },

  async invalidate(pattern) {
    try {
      // For simple pattern matching, you might need to implement pattern-based deletion
      // This is a simplified version
      await redisHelpers.del(pattern);
      console.log(`[CACHE] Invalidated key: ${pattern}`);
    } catch (error) {
      console.error(`[CACHE] Invalidation error for ${pattern}:`, error);
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (label) => ({
    start: performance.now(),
    label
  }),

  end: (timer) => {
    const duration = (performance.now() - timer.start).toFixed(2);
    console.log(`[PERF] ${timer.label}: ${duration}ms`);
    return duration;
  }
};

export default dbConnect;
>>>>>>> 01ca697 (files added with fixed bugs)
