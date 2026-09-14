const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// GET all table types (reference data — names, icons, seat counts)
router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find().sort({ typeId: 1 });
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tables' });
    }
});

// GET availability for all table types on a given date + time slot
router.get('/availability', async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({ success: false, message: 'date and time are required' });
        }

        const tables = await Table.find();

        const availability = await Promise.all(tables.map(async (table) => {
            const bookings = await Booking.find({
                tableTypeId: table.typeId,
                date,
                time,
                status: 'confirmed'
            }).select('tableNumber');

            const bookedNumbers = bookings.map((b) => b.tableNumber).sort((a, b) => a - b);
            const availableNumbers = [];
            for (let n = 1; n <= table.count; n++) {
                if (!bookedNumbers.includes(n)) availableNumbers.push(n);
            }

            const bookedCount = bookedNumbers.length;
            const available = availableNumbers.length;
            return {
                typeId: table.typeId,
                count: table.count,
                booked: bookedCount,
                available,
                isAvailable: available > 0,
                bookedNumbers,
                availableNumbers
            };
        }));

        res.status(200).json({ success: true, data: availability });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ success: false, message: 'Server error fetching availability' });
    }
});

// POST create a new booking
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { tableTypeId, date, time, guests, name, phone, email, requests } = req.body;

        if (!tableTypeId || !date || !time || !guests || !name || !phone || !email) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const table = await Table.findOne({ typeId: tableTypeId });
        if (!table) {
            return res.status(404).json({ success: false, message: 'Table type not found' });
        }

        const existingBookings = await Booking.find({
            tableTypeId,
            date,
            time,
            status: 'confirmed'
        }).select('tableNumber');

        const bookedNumbers = new Set(existingBookings.map((b) => b.tableNumber));

        if (bookedNumbers.size >= table.count) {
            return res.status(409).json({ success: false, message: 'No tables of this type available for the selected date and time' });
        }

        let tableNumber = null;
        for (let n = 1; n <= table.count; n++) {
            if (!bookedNumbers.has(n)) {
                tableNumber = n;
                break;
            }
        }

        const booking = await Booking.create({
            userId: req.user ? req.user.id : null,
            tableTypeId,
            tableName: table.name,
            tableIcon: table.icon,
            tableNumber,
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
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'That table was just booked by someone else. Please try again.' });
        }
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Server error creating booking' });
    }
});

// GET the current user's table bookings
router.get('/mybookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
});

// GET all table bookings (Admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching all bookings' });
    }
});

module.exports = router;
