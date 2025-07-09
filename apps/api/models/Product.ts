import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: [String], 
    required: false,
    default: [],
  },
  price: {
    type: Number,
    required: true,
  },
  tags: {
    type: [String],
    required: false,
    default: [],
  },
  color: {
    type: String,
    required: false,
    default: '',
  },
}, {
  timestamps: true,
});

export const Product = mongoose.model('Product', productSchema);
