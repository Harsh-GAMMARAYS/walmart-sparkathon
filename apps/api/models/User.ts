import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  activity: {
    cart: [{
      id: String,
      title: String,
      price: Number,
      quantity: Number,
      image: String,
      addedAt: { type: Date, default: Date.now }
    }],
    viewedProducts: [String],
    searchHistory: [String],
    lastActivity: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
