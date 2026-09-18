const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

// GET shifts for a given date (all employees)
router.get('/', async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        const query = {};
        if (date) query.date = date;
        if (employeeId) query.employeeId = employeeId;

        const shifts = await Shift.find(query).populate('employeeId', 'name role avatar').sort({ date: 1 });
        res.status(200).json({ success: true, data: shifts });
    } catch (error) {
        console.error('Error fetching shifts:', error);
        res.status(500).json({ success: false, message: 'Server error fetching shifts' });
    }
});

// POST assign/update a shift for an employee on a date (upsert)
router.post('/', async (req, res) => {
    try {
        const { employeeId, date, label, startTime, endTime, notes } = req.body;

        if (!employeeId || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'employeeId, date, startTime and endTime are required' });
        }

        const shift = await Shift.findOneAndUpdate(
            { employeeId, date },
            { label: label || '', startTime, endTime, notes: notes || '' },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        console.error('Error assigning shift:', error);
        res.status(500).json({ success: false, message: 'Server error assigning shift' });
    }
});

// DELETE a shift
router.delete('/:id', async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }
        await shift.deleteOne();
        res.status(200).json({ success: true, message: 'Shift removed successfully' });
    } catch (error) {
        console.error('Error deleting shift:', error);
        res.status(500).json({ success: false, message: 'Server error deleting shift' });
    }
});

module.exports = router;
