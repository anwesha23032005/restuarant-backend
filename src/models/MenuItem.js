const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, 'Please add a menu item name'],
      trim: true,
    },
    Description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    Price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    Category: {
      type: String,
      required: [true, 'Please specify a category'],
      default: 'General',
    },
    Image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    },
    IsAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);