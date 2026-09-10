const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { Name, Email, Password, AdminCode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ Email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Determine Role: assign 'Admin' if correct AdminCode is provided
    let userRole = 'Customer';
    if (AdminCode && AdminCode === process.env.ADMIN_SECRET_CODE) {
      userRole = 'Admin';
    }

    // Create user
    const user = await User.create({
      Name,
      Email,
      Password: hashedPassword,
      Role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user / Login
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check for user email
    const user = await User.findOne({ Email });

    // Validate password match
    if (user && (await bcrypt.compare(Password, user.Password))) {
      res.json({
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-Password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};