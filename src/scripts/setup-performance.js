import { createIndexes } from '../lib/mongodb-indexes.js';
import { redisHelpers } from '../lib/redis.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupPerformanceOptimizations() {
  console.log('🚀 Setting up performance optimizations...');
  
  try {
    // 1. Create MongoDB indexes
    console.log('📊 Creating MongoDB indexes...');
    await createIndexes();
    
    // 2. Test Redis connection
    console.log('🔴 Testing Redis connection...');
    const testKey = 'performance:test';
    await redisHelpers.set(testKey, { message: 'Redis is working!' }, { ex: 60 });
    const testResult = await redisHelpers.get(testKey);
    
    if (testResult) {
      console.log('✅ Redis connection successful');
      await redisHelpers.del(testKey);
    } else {
      console.log('❌ Redis connection failed');
    }
    
    // 3. Clear any existing performance-related cache
    console.log('🧹 Clearing performance cache...');
    await redisHelpers.flush();
    
    console.log('✅ Performance optimizations setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
if (process.argv[1] === __filename) {
  setupPerformanceOptimizations();
}

export default setupPerformanceOptimizations;
