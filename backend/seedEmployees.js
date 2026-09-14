const mongoose = require('mongoose');
require('dotenv').config();

const Employee = require('./models/Employee');

const SEED_EMPLOYEES = [
    { name: 'Ravi Kumar', role: 'Head Chef', phone: '9876543210', email: 'ravi.kumar@cravebite.com', avatar: '👨‍🍳' },
    { name: 'Priya Sharma', role: 'Sous Chef', phone: '9876543211', email: 'priya.sharma@cravebite.com', avatar: '👩‍🍳' },
    { name: 'Amit Verma', role: 'Waiter', phone: '9876543212', email: 'amit.verma@cravebite.com', avatar: '🧑‍💼' },
    { name: 'Sneha Iyer', role: 'Waiter', phone: '9876543213', email: 'sneha.iyer@cravebite.com', avatar: '🧑‍💼' },
    { name: 'Karthik Reddy', role: 'Cashier', phone: '9876543214', email: 'karthik.reddy@cravebite.com', avatar: '💁' },
    { name: 'Anjali Nair', role: 'Manager', phone: '9876543215', email: 'anjali.nair@cravebite.com', avatar: '🧑‍💻' },
    { name: 'Suresh Babu', role: 'Cleaner', phone: '9876543216', email: 'suresh.babu@cravebite.com', avatar: '🧹' },
    { name: 'Divya Menon', role: 'Host', phone: '9876543217', email: 'divya.menon@cravebite.com', avatar: '🙋‍♀️' }
];

async function seedData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Missing MONGODB_URI environment variable. Please check your .env file.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        for (const item of SEED_EMPLOYEES) {
            const existing = await Employee.findOne({ email: item.email });
            if (existing) {
                console.log(`Employee "${item.name}" already exists. Skipping...`);
                continue;
            }
            await Employee.create(item);
            console.log(`Created employee "${item.name}" (${item.role}).`);
        }

        console.log('\nAll employees seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding employees:', error);
        process.exit(1);
    }
}

seedData();
