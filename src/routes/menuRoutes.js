const express = require('express');
const router = express.Router();
const {
  getExternalMenuItems,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public endpoints
router.get('/external', getExternalMenuItems);
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin-protected endpoints (supporting Cloudinary file uploads)
router.post('/', protect, adminOnly, upload.single('Image'), createMenuItem);
router.put('/:id', protect, adminOnly, upload.single('Image'), updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;