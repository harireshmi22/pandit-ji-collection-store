import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { dbConnect } from '../src/lib/dbConnect.js';
import Product from '../src/models/Product.js';

const categories = ['T-shirt', 'Formal', 'Top Wear', 'Bottom Wear'];
const brands = ['Pandit Ji Collection', 'Urban Threads', 'Street Style', 'Zara'];
const genders = ['Men', 'Women', 'Unisex'];
const colors = ['Black', 'White', 'Blue', 'Navy', 'Brown', 'Cream', 'Charcoal', 'Pink', 'Olive'];
const materials = ['Cotton', 'Denim', 'Wool Blend', 'Linen', 'Leather', 'Canvas', 'Mesh', 'Silk'];
const sizes = ['S', 'M', 'L', 'XL', 'One Size'];
const adjectiveWords = ['Classic', 'Premium', 'Modern', 'Urban', 'Elegant', 'Comfort', 'Slim Fit', 'Signature'];

const categoryProductWords = {
  'T-shirt': ['Crew Tee', 'Graphic Tee', 'Polo Tee', 'Essential Tee'],
  Formal: ['Formal Shirt', 'Dress Shirt', 'Office Blazer', 'Formal Trouser'],
  'Top Wear': ['Top', 'Shirt', 'Kurti Top', 'Casual Blouse'],
  'Bottom Wear': ['Jeans', 'Chinos', 'Trousers', 'Pants'],
};

const categoryImages = {
  'T-shirt': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=900&h=1100&fit=crop',
  ],
  Formal: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=900&h=1100&fit=crop',
  ],
  'Top Wear': [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=1100&fit=crop',
  ],
  'Bottom Wear': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&h=1100&fit=crop',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&h=1100&fit=crop',
  ],
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildProductName(index, category) {
  const productWords = categoryProductWords[category] || ['Product'];
  return `${randomItem(adjectiveWords)} ${randomItem(colors)} ${randomItem(productWords)} ${index + 1}`;
}

function buildProductDescription(name, category, material) {
  return `${name} for everyday comfort. Built with ${material} and crafted for ${category.toLowerCase()} styling.`;
}

function buildImage(index, category) {
  const pool = categoryImages[category] || [];
  if (pool.length === 0) {
    return `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&seed=${index + 1}`;
  }
  return pool[index % pool.length];
}

function createProduct(index) {
  const category = randomItem(categories);
  const brand = randomItem(brands);
  const gender = randomItem(genders);
  const color = randomItem(colors);
  const material = randomItem(materials);
  const size = randomItem(sizes.slice(0, 4));
  const price = randomInt(899, 6999);
  const discount = randomInt(10, 35);
  const originalPrice = Number((price / (1 - discount / 100)).toFixed(2));
  const rating = Number((Math.random() * 1.5 + 3.5).toFixed(1));
  const name = buildProductName(index, category);
  const image = buildImage(index, category);

  return {
    name,
    description: buildProductDescription(name, category, material),
    price,
    originalPrice,
    category,
    brand,
    gender,
    color,
    material,
    size,
    image,
    images: [image],
    stock: randomInt(5, 80),
    rating,
    reviews: randomInt(0, 120),
    featured: Math.random() > 0.75,
    isNewArrival: Math.random() > 0.5,
    discount,
  };
}

function generateProducts(count = 20) {
  return Array.from({ length: count }, (_, index) => createProduct(index));
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const modeArg = args.find((arg) => arg.startsWith('--mode='));

  const parsedCount = countArg ? Number(countArg.split('=')[1]) : 20;
  const count = Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : 20;
  const mode = modeArg ? modeArg.split('=')[1] : 'replace';

  return {
    count,
    mode: mode === 'append' ? 'append' : 'replace',
  };
}

async function seedDatabase() {
  try {
    const { count, mode } = parseCliArgs();
    const generatedProducts = generateProducts(count);

    await dbConnect();

    if (mode === 'replace') {
      await Product.deleteMany({});
      console.log('Cleared existing products (mode=replace)');
    } else {
      console.log('Keeping existing products (mode=append)');
    }

    const insertedProducts = await Product.insertMany(generatedProducts);
    console.log(`✅ Successfully inserted ${insertedProducts.length} products`);

    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - INR ${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
