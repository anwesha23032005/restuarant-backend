const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const MenuItem = require('./src/models/MenuItem');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear existing menu items to avoid duplicates
    await MenuItem.deleteMany();
    console.log('🗑️ Existing menu items cleared...');

    // Fetch meals from TheMealDB API
    const response = await axios.get(
      'https://www.themealdb.com/api/json/v1/1/filter.php?a=India'
    );

    const meals = response.data.meals;

    if (!meals) {
      console.log('❌ No meals found from TheMealDB API.');
      process.exit(1);
    }

    // Format meals to match your MenuItem schema
    const sampleMenuItems = meals.map((meal) => ({
      Name: meal.strMeal,
      Description: meal.strInstructions
        ? meal.strInstructions.slice(0, 150) + '...'
        : 'Delicious freshly prepared dish from our kitchen.',
      Price: parseFloat((Math.random() * 15 + 8).toFixed(2)), // Random price between $8 and $23
      Category: meal.strCategory || 'Main Course',
      Image: meal.strMealThumb, // Direct image URL from TheMealDB
      IsAvailable: true,
    }));

    // Insert into MongoDB
    await MenuItem.insertMany(sampleMenuItems);

    console.log(`✅ Successfully seeded ${sampleMenuItems.length} items from TheMealDB into MongoDB!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data seeder: ${error.message}`);
    process.exit(1);
  }
};

importData();