const express = require('express');
const router = express.Router();
const PerformanceNote = require('../models/PerformanceNote');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

// GET performance notes for an employee
router.get('/', async (req, res) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'employeeId is required' });
        }

        const notes = await PerformanceNote.find({ employeeId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        console.error('Error fetching performance notes:', error);
        res.status(500).json({ success: false, message: 'Server error fetching performance notes' });
    }
});

// POST add a performance note for an employee
router.post('/', async (req, res) => {
    try {
        const { employeeId, note, rating } = req.body;

        if (!employeeId || !note) {
            return res.status(400).json({ success: false, message: 'employeeId and note are required' });
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
        }

        const performanceNote = await PerformanceNote.create({
            employeeId,
            note,
            rating,
            createdBy: req.user.name
        });

        res.status(201).json({ success: true, data: performanceNote });
    } catch (error) {
        console.error('Error adding performance note:', error);
        res.status(500).json({ success: false, message: 'Server error adding performance note' });
    }
});

// DELETE a performance note (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const note = await PerformanceNote.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Performance note not found' });
        }
        await note.deleteOne();
        res.status(200).json({ success: true, message: 'Performance note deleted successfully' });
    } catch (error) {
        console.error('Error deleting performance note:', error);
        res.status(500).json({ success: false, message: 'Server error deleting performance note' });
    }
});

module.exports = router;
