import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    originalPrice: Number,
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },

    brand: String,
    gender: String,
    size: String,
    sizes: [String],
    color: String,
    colors: [String],
    material: String,
    materials: [String],


    image: String,
    images: [String],
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    discount: Number,
  },
  { timestamps: true }
);

// Schema-level indexes for query performance
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index({ isNewArrival: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ reviews: -1, rating: -1 });
productSchema.index({ rating: -1, reviews: -1 });
productSchema.index({ name: 'text', brand: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
