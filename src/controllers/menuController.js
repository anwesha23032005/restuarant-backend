const MenuItem = require('../models/MenuItem');
const axios = require('axios');

// @desc    Fetch dishes from TheMealDB API & transform to fit MenuItem schema
// @route   GET /api/menu-items/external
// @access  Public
const getExternalMenuItems = async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.themealdb.com/api/json/v1/1/search.php?s='
    );

    if (!response.data.meals) {
      return res.status(404).json({ message: 'No meals found from API' });
    }

    // Map TheMealDB fields to match your MERN MenuItem schema
    const formattedMeals = response.data.meals.map((meal) => ({
      Name: meal.strMeal,
      Description: meal.strInstructions
        ? meal.strInstructions.slice(0, 120) + '...'
        : 'Delicious freshly prepared dish.',
      Price: parseFloat((Math.random() * 10 + 8).toFixed(2)), // Generate price ($8.00 - $18.00)
      Category: meal.strCategory || 'General',
      Image: meal.strMealThumb,
      IsAvailable: true,
    }));

    res.json(formattedMeals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch from TheMealDB API', error: error.message });
  }
};

// @desc    Get all menu items from MongoDB
// @route   GET /api/menu-items
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu-items/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu-items
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { Name, Description, Price, Category, IsAvailable } = req.body;

    // Check if image was uploaded via Cloudinary (req.file) or passed as a URL string (req.body.Image)
    let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';

    if (req.file && req.file.path) {
      // Image file uploaded via Multer + Cloudinary
      imageUrl =`http://localhost:5000/uploads/${req.file.filename}`;
    } else if (req.body && req.body.Image) {
      // Direct image URL string passed (e.g., external API image link)
      imageUrl = req.body.Image;
    }

    const menuItem = new MenuItem({
      Name,
      Description,
      Price: Number(Price),
      Category,
      Image: imageUrl,
      IsAvailable: IsAvailable !== undefined ? (IsAvailable === true || IsAvailable === 'true') : true,
    });

    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { Name, Description, Price, Category, IsAvailable } = req.body;
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    let imageUrl = item.Image;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else if (req.body && req.body.Image) {
      imageUrl = req.body.Image;
    }

    item.Name = Name || item.Name;
    item.Description = Description || item.Description;
    item.Price = Price !== undefined ? Number(Price) : item.Price;
    item.Category = Category || item.Category;
    item.Image = imageUrl;
    
    // Explicitly parse string or boolean values correctly
    if (IsAvailable !== undefined) {
      item.IsAvailable = IsAvailable === true || IsAvailable === 'true';
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExternalMenuItems,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};