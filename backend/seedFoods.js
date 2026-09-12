const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Food = require('./models/Food');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const defaultCategories = {
    'biriyani': 'Main Course',
    'burger': 'Fast Food',
    'chaat': 'Snacks',
    'cheesecake': 'Dessert',
    'dosa': 'South Indian',
    'frenchfries': 'Fast Food',
    'freshjuice': 'Beverages',
    'friedrice': 'Chinese',
    'grilledchicken': 'Main Course',
    'icecream': 'Dessert',
    'momos': 'Snacks',
    'naan': 'Indian Breads',
    'noodles': 'Chinese',
    'pasta': 'Italian',
    'pizza': 'Italian',
    'salads': 'Healthy',
    'sandwich': 'Fast Food',
    'soups': 'Soups'
};

const defaultPrices = {
    'biriyani': 250,
    'burger': 150,
    'chaat': 80,
    'cheesecake': 200,
    'dosa': 120,
    'frenchfries': 100,
    'freshjuice': 90,
    'friedrice': 180,
    'grilledchicken': 300,
    'icecream': 120,
    'momos': 140,
    'naan': 40,
    'noodles': 160,
    'pasta': 220,
    'pizza': 280,
    'salads': 150,
    'sandwich': 130,
    'soups': 110
};

const imagesDir = path.join(__dirname, '../frontend/images');

async function seedData() {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.MONGODB_URI) {
            console.error("Missing Cloudinary or MongoDB environment variables. Please check your .env file.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Read images
        const files = fs.readdirSync(imagesDir);

        for (const file of files) {
            // Ignore non-image files if any
            if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;

            const ext = path.extname(file);
            // Some files have double extensions like .jpg.jpg
            let baseName = file.replace(ext, '').toLowerCase();
            if (baseName.endsWith('.jpg')) {
                baseName = baseName.replace('.jpg', '');
            }
            
            // Format item name
            const itemName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
            const category = defaultCategories[baseName] || 'Other';
            const price = defaultPrices[baseName] || 100;

            console.log(`\nUploading ${file}...`);
            const filePath = path.join(imagesDir, file);
            
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'cravebite_foods'
            });

            console.log(`Uploaded to Cloudinary: ${result.secure_url}`);

            const newFood = new Food({
                name: itemName,
                description: `Delicious ${itemName} prepared fresh.`,
                price: price,
                category: category,
                imageUrl: result.secure_url,
                imagePublicId: result.public_id,
                isAvailable: true
            });

            await newFood.save();
            console.log(`Saved ${itemName} to database.`);
        }

        console.log("\nAll foods seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seedData();
