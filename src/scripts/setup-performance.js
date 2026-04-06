import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env before imports
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      let [key, ...valueParts] = trimmed.split('=');
      let value = valueParts.join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

async function setupPerformanceOptimizations() {
  console.log('🚀 Setting up performance optimizations...');
  
  const { default: redis } = await import('../lib/redis.js');
  const { createIndexes } = await import('../lib/mongodb-indexes.js');
  
  try {
    // 1. Create MongoDB indexes
    console.log('📊 Creating MongoDB indexes...');
    await createIndexes();
    
    // 2. Test Redis connection
    console.log('🔴 Testing Redis connection...');
    const testKey = 'performance:test';
    
    if (redis) {
      await redis.set(testKey, { message: 'Redis is working!' }, { ex: 60 });
      const testResult = await redis.get(testKey);
      
      if (testResult) {
        console.log('✅ Redis connection successful');
        await redis.del(testKey);
      } else {
        console.log('❌ Redis connection failed');
      }
      
      // 3. Clear any existing performance-related cache
      console.log('🧹 Clearing performance cache...');
      await redis.flushdb();
    } else {
       console.log('⚠️ Redis client not initialized.');
    }
    
    console.log('✅ Performance optimizations setup complete!');
    process.exit(0);
    
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
