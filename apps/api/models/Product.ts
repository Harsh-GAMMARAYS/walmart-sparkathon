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
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: mongoose.Schema.Types.Mixed, // Allow both String and Object types
    required: false,
  },
}, {
  timestamps: true,
});

productSchema.pre('save', function(next) {
  if (this.image && typeof this.image === 'object') {
    if (this.image.bytes) {
      this.image = this.image.bytes;
    } else if (this.image.data) {
      this.image = this.image.data;
    } else if (this.image.base64) {
      this.image = this.image.base64;
    }
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
