<<<<<<< HEAD
import Product from '../models/Product.js';
import { dbConnect } from './db-optimized.js';

// Create indexes for better query performance
export async function createIndexes() {
  try {
    await dbConnect();

    console.log('[INDEX] Creating MongoDB indexes...');

    // Product collection indexes
    await Product.collection.createIndexes([
      // Single field indexes
      { key: { name: 'text' }, name: 'name_text' },
      { key: { description: 'text' }, name: 'description_text' },
      { key: { brand: 1 }, name: 'brand_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { price: 1 }, name: 'price_1' },
      { key: { stock: 1 }, name: 'stock_1' },
      { key: { createdAt: -1 }, name: 'created_at_-1' },
      { key: { featured: 1 }, name: 'featured_1' },
      { key: { isNewArrival: 1 }, name: 'is_new_arrival_1' },

      // Compound indexes for common query patterns
      {
        key: { category: 1, createdAt: -1 },
        name: 'category_created_at_-1'
      },
      {
        key: { brand: 1, category: 1 },
        name: 'brand_category_1'
      },
      {
        key: { category: 1, price: 1 },
        name: 'category_price_1'
      },

      // Text search index for full-text search
      {
        key: {
          name: 'text',
          description: 'text',
          brand: 'text'
        },
        name: 'search_text',
        default_language: 'english',
        language_override: 'language'
      }
    ]);

    console.log('[INDEX] All indexes created successfully');

  } catch (error) {
    console.error('[INDEX] Error creating indexes:', error);
    throw error;
  }
}

// Function to check existing indexes
export async function checkIndexes() {
  try {
    await dbConnect();
    const indexes = await Product.collection.getIndexes();

    console.log('[INDEX] Existing indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    return indexes;
  } catch (error) {
    console.error('[INDEX] Error checking indexes:', error);
    return [];
  }
}

const mongodbIndexes = { createIndexes, checkIndexes };

export default mongodbIndexes;
=======
import Product from '../models/Product.js';
import { dbConnect } from './db-optimized.js';

// Create indexes for better query performance
export async function createIndexes() {
  try {
    await dbConnect();

    console.log('[INDEX] Creating MongoDB indexes...');

    // Product collection indexes
    await Product.collection.createIndexes([
      // Single field indexes
      { key: { name: 'text' }, name: 'name_text' },
      { key: { description: 'text' }, name: 'description_text' },
      { key: { brand: 1 }, name: 'brand_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { price: 1 }, name: 'price_1' },
      { key: { stock: 1 }, name: 'stock_1' },
      { key: { createdAt: -1 }, name: 'created_at_-1' },
      { key: { featured: 1 }, name: 'featured_1' },
      { key: { isNewArrival: 1 }, name: 'is_new_arrival_1' },

      // Compound indexes for common query patterns
      {
        key: { category: 1, createdAt: -1 },
        name: 'category_created_at_-1'
      },
      {
        key: { brand: 1, category: 1 },
        name: 'brand_category_1'
      },
      {
        key: { category: 1, price: 1 },
        name: 'category_price_1'
      },

      // Text search index for full-text search
      {
        key: {
          name: 'text',
          description: 'text',
          brand: 'text'
        },
        name: 'search_text',
        default_language: 'english',
        language_override: 'language'
      }
    ]);

    console.log('[INDEX] All indexes created successfully');

  } catch (error) {
    console.error('[INDEX] Error creating indexes:', error);
    throw error;
  }
}

// Function to check existing indexes
export async function checkIndexes() {
  try {
    await dbConnect();
    const indexes = await Product.collection.getIndexes();

    console.log('[INDEX] Existing indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    return indexes;
  } catch (error) {
    console.error('[INDEX] Error checking indexes:', error);
    return [];
  }
}

const mongodbIndexes = { createIndexes, checkIndexes };

export default mongodbIndexes;
>>>>>>> 01ca697 (files added with fixed bugs)
