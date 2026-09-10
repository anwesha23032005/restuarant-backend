const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    Email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    Password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
    Role: {
      type: String,
      enum: ['Customer', 'Admin'],
      default: 'Customer',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);