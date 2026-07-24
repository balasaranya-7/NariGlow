const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category display name is required'],
      trim: true
    },
    categorySlug: {
      type: String,
      required: [true, 'Product category slug is required'],
      trim: true,
      lowercase: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    oldPrice: {
      type: Number,
      default: null
    },
    discountPct: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    rating: {
      type: Number,
      default: 0.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviews: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      required: [true, 'At least one secondary image is required']
    },
    img: {
      type: String,
      required: [true, 'Main product image URL is required']
    },
    stock: {
      type: String,
      enum: ['in', 'low'],
      default: 'in'
    },
    material: {
      type: String,
      default: ''
    },
    care: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Search indexes to support efficient text search in backend
productSchema.index({ name: 'text', brand: 'text', category: 'text', desc: 'text' });

module.exports = mongoose.model('Product', productSchema);
