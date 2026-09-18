const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

// GET leave requests (optionally filter by status/employee)
router.get('/', async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        const query = {};
        if (status) query.status = status;
        if (employeeId) query.employeeId = employeeId;

        const leaves = await Leave.find(query).populate('employeeId', 'name role avatar').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ success: false, message: 'Server error fetching leave requests' });
    }
});

// POST create a leave request for an employee
router.post('/', async (req, res) => {
    try {
        const { employeeId, fromDate, toDate, reason } = req.body;

        if (!employeeId || !fromDate || !toDate || !reason) {
            return res.status(400).json({ success: false, message: 'employeeId, fromDate, toDate and reason are required' });
        }

        const leave = await Leave.create({ employeeId, fromDate, toDate, reason });
        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ success: false, message: 'Server error creating leave request' });
    }
});

// PUT approve/reject a leave request (admin only)
router.put('/:id', authorize('admin'), async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'status must be approved or rejected' });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, reviewNotes: reviewNotes || '', reviewedBy: req.user.name },
            { new: true, runValidators: true }
        );

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        console.error('Error reviewing leave request:', error);
        res.status(500).json({ success: false, message: 'Server error reviewing leave request' });
    }
});

// DELETE a leave request (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }
        await leave.deleteOne();
        res.status(200).json({ success: true, message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({ success: false, message: 'Server error deleting leave request' });
    }
});

module.exports = router;
