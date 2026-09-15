const mongoose = require('mongoose');
require('dotenv').config();

const Table = require('./models/Table');

const SEED_TABLES = [
    { typeId: 'vip', name: 'VIP Lounge', seats: '2–4 guests', icon: '👑', vibe: 'Premium & Private', desc: 'Elevated seating with dedicated service.', count: 5 },
    { typeId: 'window', name: 'Window Seat', seats: '2–4 guests', icon: '🌇', vibe: 'Scenic & Romantic', desc: 'Perfect for date nights and golden hour.', count: 5 },
    { typeId: 'family', name: 'Family Table', seats: '4–6 guests', icon: '👨‍👩‍👧‍👦', vibe: 'Spacious & Casual', desc: 'Room to spread out with the whole crew.', count: 5 },
    { typeId: 'bar', name: 'Bar Counter', seats: '1–2 guests', icon: '🍹', vibe: 'Casual & Social', desc: 'Grab a seat by the action.', count: 5 },
    { typeId: 'booth', name: 'Private Booth', seats: '4–8 guests', icon: '🛋️', vibe: 'Cozy & Enclosed', desc: 'Tucked-away comfort for groups.', count: 5 }
];

async function seedData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Missing MONGODB_URI environment variable. Please check your .env file.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        for (const item of SEED_TABLES) {
            const existing = await Table.findOne({ typeId: item.typeId });
            if (existing) {
                console.log(`Table type "${item.typeId}" already exists. Skipping...`);
                continue;
            }
            await Table.create(item);
            console.log(`Created table type "${item.typeId}" with count ${item.count}.`);
        }

        console.log('\nAll table types seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding table types:', error);
        process.exit(1);
    }
}

seedData();
