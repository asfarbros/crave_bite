const express = require('express');
const router = express.Router();
const Hall = require('../models/Hall');
const HallBooking = require('../models/HallBooking');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// GET availability for all halls on a given date + time slot
router.get('/availability', async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({ success: false, message: 'date and time are required' });
        }

        const halls = await Hall.find();

        const availability = await Promise.all(halls.map(async (hall) => {
            const bookedCount = await HallBooking.countDocuments({
                hallId: hall.hallId,
                date,
                time,
                status: 'confirmed'
            });
            const available = Math.max(hall.count - bookedCount, 0);
            return {
                hallId: hall.hallId,
                count: hall.count,
                booked: bookedCount,
                available,
                isAvailable: available > 0
            };
        }));

        res.status(200).json({ success: true, data: availability });
    } catch (error) {
        console.error('Error fetching hall availability:', error);
        res.status(500).json({ success: false, message: 'Server error fetching availability' });
    }
});

// POST create a new hall booking
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { hallId, date, time, eventType, guestCount, name, phone, email, requests } = req.body;

        if (!hallId || !date || !time || !eventType || !guestCount || !name || !phone || !email) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const hall = await Hall.findOne({ hallId });
        if (!hall) {
            return res.status(404).json({ success: false, message: 'Hall not found' });
        }

        const bookedCount = await HallBooking.countDocuments({
            hallId,
            date,
            time,
            status: 'confirmed'
        });

        if (bookedCount >= hall.count) {
            return res.status(409).json({ success: false, message: 'This hall is already booked for the selected date and time' });
        }

        const booking = await HallBooking.create({
            userId: req.user ? req.user.id : null,
            hallId,
            hallName: hall.name,
            hallIcon: hall.icon,
            date,
            time,
            eventType,
            guestCount,
            name,
            phone,
            email,
            requests
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error('Error creating hall booking:', error);
        res.status(500).json({ success: false, message: 'Server error creating hall booking' });
    }
});

// GET the current user's hall bookings
router.get('/mybookings', protect, async (req, res) => {
    try {
        const bookings = await HallBooking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching hall bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching hall bookings' });
    }
});

// GET all hall bookings (Admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const bookings = await HallBooking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching all hall bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching all hall bookings' });
    }
});

module.exports = router;
