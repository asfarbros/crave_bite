const mongoose = require('mongoose');
require('dotenv').config();

const Hall = require('./models/Hall');

const SEED_HALLS = [
    {
        hallId: 'A',
        name: 'Hall A',
        price: 5000,
        capacity: 50,
        gradient: 'from-pink-400 to-rose-500',
        icon: '🎂',
        features: ['Intimate atmosphere', 'Stage for performances', 'Catering included'],
        count: 1
    },
    {
        hallId: 'B',
        name: 'Hall B',
        price: 8000,
        capacity: 100,
        gradient: 'from-indigo-400 to-purple-500',
        icon: '🎊',
        features: ['Professional lighting', 'Audio system included', 'Catering included'],
        count: 1
    },
    {
        hallId: 'C',
        name: 'Hall C',
        price: 12000,
        capacity: 150,
        gradient: 'from-amber-400 to-orange-500',
        icon: '🥂',
        features: ['Premium amenities', 'Full AV system', 'Catering included'],
        count: 1
    }
];

async function seedData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Missing MONGODB_URI environment variable. Please check your .env file.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        for (const item of SEED_HALLS) {
            const existing = await Hall.findOne({ hallId: item.hallId });
            if (existing) {
                console.log(`Hall "${item.hallId}" already exists. Skipping...`);
                continue;
            }
            await Hall.create(item);
            console.log(`Created hall "${item.hallId}".`);
        }

        console.log('\nAll halls seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding halls:', error);
        process.exit(1);
    }
}

seedData();
