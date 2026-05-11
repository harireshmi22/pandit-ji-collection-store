import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 }, { unique: true })

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
