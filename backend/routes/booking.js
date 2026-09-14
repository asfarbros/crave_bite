const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const Booking = require('../models/Booking');

// GET availability for all table types on a given date + time slot
router.get('/availability', async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({ success: false, message: 'date and time are required' });
        }

        const tables = await Table.find();

        const availability = await Promise.all(tables.map(async (table) => {
            const bookedCount = await Booking.countDocuments({
                tableTypeId: table.typeId,
                date,
                time,
                status: 'confirmed'
            });
            const available = Math.max(table.count - bookedCount, 0);
            return {
                typeId: table.typeId,
                count: table.count,
                booked: bookedCount,
                available,
                isAvailable: available > 0
            };
        }));

        res.status(200).json({ success: true, data: availability });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ success: false, message: 'Server error fetching availability' });
    }
});

// POST create a new booking
router.post('/', async (req, res) => {
    try {
        const { tableTypeId, date, time, guests, name, phone, email, requests } = req.body;

        if (!tableTypeId || !date || !time || !guests || !name || !phone || !email) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const table = await Table.findOne({ typeId: tableTypeId });
        if (!table) {
            return res.status(404).json({ success: false, message: 'Table type not found' });
        }

        const bookedCount = await Booking.countDocuments({
            tableTypeId,
            date,
            time,
            status: 'confirmed'
        });

        if (bookedCount >= table.count) {
            return res.status(409).json({ success: false, message: 'No tables of this type available for the selected date and time' });
        }

        const booking = await Booking.create({
            tableTypeId,
            date,
            time,
            guests,
            name,
            phone,
            email,
            requests
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Server error creating booking' });
    }
});

module.exports = router;
