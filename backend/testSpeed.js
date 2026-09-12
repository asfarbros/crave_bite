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

async function runSpeedTest() {
    console.log("=== STARTING SPEED TEST ===\n");

    try {
        // 1. Test MongoDB Connection Speed
        console.log("1. Testing MongoDB Connection...");
        console.time("MongoDB Connect");
        await mongoose.connect(process.env.MONGODB_URI);
        console.timeEnd("MongoDB Connect");
        
        // 2. Test MongoDB Read Speed
        console.log("\n2. Testing MongoDB Read (findOne)...");
        console.time("MongoDB findOne");
        await Food.findOne({ name: 'Juicy Burger' });
        console.timeEnd("MongoDB findOne");

        // 3. Test Cloudinary Upload Speed
        console.log("\n3. Testing Cloudinary Upload...");
        const imagePath = path.join(__dirname, '../frontend/images/burger.jpg');
        
        if (!fs.existsSync(imagePath)) {
            console.log(`[SKIP] Image not found at ${imagePath}`);
        } else {
            const sharp = require('sharp');
            
            console.time("Image Compression (sharp)");
            const imageBuffer = await sharp(imagePath)
                .resize({ width: 800, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
            console.timeEnd("Image Compression (sharp)");
            console.log(`Original size: ${(fs.statSync(imagePath).size / 1024).toFixed(2)} KB`);
            console.log(`Compressed size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

            console.time("Cloudinary Upload");
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'cravebite_test', timeout: 30000 },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(imageBuffer);
            });
            console.timeEnd("Cloudinary Upload");
            console.log("Cloudinary URL: ", result.secure_url);
        }

        console.log("\n=== SPEED TEST COMPLETE ===");
        process.exit(0);

    } catch (error) {
        console.error("\n[ERROR] Speed test failed:", error);
        process.exit(1);
    }
}

runSpeedTest();
