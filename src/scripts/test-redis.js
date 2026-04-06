import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

async function testRedis() {
  console.log('🔴 Testing Redis connection...');
  
  const { default: redis } = await import('../lib/redis.js');
  
  if (!redis) {
    console.error('❌ Redis client is not initialized. Please check your UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
    return false;
  }
  
  try {
    const testKey = 'test:redis';
    const testData = { 
      message: 'Redis is working!', 
      timestamp: new Date().toISOString() 
    };
    
    // Test SET
    const setResult = await redis.set(testKey, testData, { ex: 60 });
    console.log('SET Result:', setResult);
    
    // Test GET
    const getResult = await redis.get(testKey);
    console.log('GET Result:', getResult);
    
    // Verify data integrity
    if (getResult && getResult.message === testData.message) {
      console.log('✅ Redis connection successful - Data integrity verified');
      
      // Clean up
      await redis.del(testKey);
      console.log('🧹 Test key cleaned up');
      
      return true;
    } else {
      console.log('❌ Redis data integrity check failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    return false;
  }
}

// Run test
testRedis().then(success => {
  if (success) {
    console.log('🎉 Redis is ready for production use!');
  } else {
    console.log('⚠️  Redis setup needs attention');
  }
  process.exit(success ? 0 : 1);
});
