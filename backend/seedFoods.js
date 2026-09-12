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

const SEED_ITEMS = [
    { name: 'Juicy Burger', price: 249, category: 'Fast Food', description: 'Juicy double beef patty with cheese, lettuce and our signature sauce.', file: 'burger.jpg' },
    { name: 'Cheesy Pizza', price: 299, category: 'Fast Food', description: 'Classic cheese pizza with crispy pepperoni and herbs.', file: 'pizza.webp' },
    { name: 'Italian Pasta', price: 229, category: 'Main Course', description: 'Rich and creamy Alfredo sauce over perfectly cooked penne.', file: 'pasta.jpeg' },
    { name: 'Chicken Biriyani', price: 399, category: 'Main Course', description: 'Aromatic basmati rice cooked with tender chicken and exotic spices.', file: 'biriyani.jpg' },
    { name: 'Masala Dosa', price: 189, category: 'South Indian', description: 'Crispy rice crepe filled with spiced potato and served with chutney.', file: 'dosa.jpg' },
    { name: 'Stir Fry Noodles', price: 279, category: 'Main Course', description: 'Wok-tossed noodles with fresh vegetables and soy sauce.', file: 'noodles.jpg' },
    { name: 'Chicken Fried Rice', price: 259, category: 'Main Course', description: 'Fragrant rice stir-fried with chicken, eggs, and vegetables.', file: 'friedrice.jpg' },
    { name: 'Grilled Chicken', price: 349, category: 'Main Course', description: 'Tender chicken breast grilled to perfection with herbs.', file: 'grilledchicken.jpg' },
    { name: 'Club Sandwich', price: 199, category: 'Fast Food', description: 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato.', file: 'sandwich.jpg' },
    { name: 'Fresh Garden Salad', price: 179, category: 'Salads', description: 'Mixed greens with cherry tomatoes, cucumber, and vinaigrette.', file: 'salads.jpg' },
    { name: 'Tomato Soup', price: 159, category: 'Soups', description: 'Creamy tomato soup with a hint of basil and croutons.', file: 'soups.jpg' },
    { name: 'Steamed Momos', price: 169, category: 'Starters', description: 'Delicate dumplings filled with minced chicken and vegetables.', file: 'momos.jpg' },
    { name: 'Papdi Chaat', price: 139, category: 'Starters', description: 'Crispy papdi topped with yogurt, chutneys, and spices.', file: 'chaat.jpg' },
    { name: 'Crispy French Fries', price: 119, category: 'Fast Food', description: 'Golden crispy fries served with ketchup and mayo.', file: 'frenchfries.jpg' },
    { name: 'Butter Naan', price: 49, category: 'Breads', description: 'Soft and fluffy naan bread brushed with butter.', file: 'naan.jpg' },
    { name: 'Fresh Orange Juice', price: 89, category: 'Beverages', description: 'Pure and refreshing orange juice made from fresh oranges.', file: 'freshjuice.jpg' },
    { name: 'Vanilla Ice Cream', price: 99, category: 'Desserts', description: 'Creamy vanilla ice cream with chocolate sauce.', file: 'icecream.jpg' },
    { name: 'New York Cheesecake', price: 149, category: 'Desserts', description: 'Rich and creamy cheesecake with berry compote.', file: 'cheesecake.jpg' }
];



const imagesDir = path.join(__dirname, '../frontend/images');

async function seedData() {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.MONGODB_URI) {
            console.error("Missing Cloudinary or MongoDB environment variables. Please check your .env file.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        for (const item of SEED_ITEMS) {
            // Check if food already exists to avoid duplicates
            const existingFood = await Food.findOne({ name: item.name });
            if (existingFood) {
                console.log(`${item.name} already exists in database. Skipping...`);
                continue;
            }

            const filePath = path.join(imagesDir, item.file);
            
            if (!fs.existsSync(filePath)) {
                console.log(`Image not found for ${item.name} at ${filePath}. Skipping...`);
                continue;
            }

            try {
                console.log(`\nCompressing ${item.file}...`);
                // Compress and resize the image down to ~100KB so it uploads in 1 second instead of 3 minutes
                const sharp = require('sharp');
                const imageBuffer = await sharp(filePath)
                    .resize({ width: 800, withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                console.log(`Uploading compressed ${item.file}...`);
                
                let result;
                let retries = 3;
                while (retries > 0) {
                    try {
                        result = await new Promise((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                { folder: 'cravebite_foods', timeout: 30000 },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            uploadStream.end(imageBuffer);
                        });
                        break; // Success, exit retry loop
                    } catch (uploadError) {
                        retries--;
                        console.error(`Upload failed for ${item.file}. Retries left: ${retries}`);
                        if (retries === 0) throw uploadError;
                        // wait 2 seconds before retry
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }

                console.log(`Uploaded to Cloudinary: ${result.secure_url}`);

                const newFood = new Food({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    imageUrl: result.secure_url,
                    imagePublicId: result.public_id,
                    isAvailable: true
                });

                await newFood.save();
                console.log(`Saved ${item.name} to database.`);
            } catch (err) {
                console.error(`\n[ERROR] Failed to process ${item.name}:`, err.message || err);
                console.log("Continuing to next item...\n");
            }
        }

        console.log("\nAll foods seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seedData();
