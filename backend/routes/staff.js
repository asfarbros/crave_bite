const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// GET all employees
router.get('/', async (req, res) => {
    try {
        let query = { isActive: true };
        if (req.query.all === 'true') query = {};

        const employees = await Employee.find(query).sort({ name: 1 });
        res.status(200).json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, message: 'Server error fetching employees' });
    }
});

// POST add a new employee
router.post('/', async (req, res) => {
    try {
        const { name, role, phone, email, avatar, joinDate } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required' });
        }

        const employee = await Employee.create({ name, role, phone, email, avatar, joinDate });
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ success: false, message: 'Server error adding employee' });
    }
});

// PUT update an employee (details or active status)
router.put('/:id', async (req, res) => {
    try {
        const { name, role, phone, email, avatar, isActive } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (isActive !== undefined) updateData.isActive = isActive;

        const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: 'Server error updating employee' });
    }
});

// DELETE an employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        await employee.deleteOne();
        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ success: false, message: 'Server error deleting employee' });
    }
});

// GET attendance for all active employees on a given date
router.get('/attendance', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'date is required' });
        }

        const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
        const records = await Attendance.find({ date, employeeId: { $in: employees.map((e) => e._id) } });

        const recordMap = {};
        records.forEach((r) => {
            recordMap[r.employeeId.toString()] = r;
        });

        const data = employees.map((emp) => ({
            employee: emp,
            status: recordMap[emp._id.toString()]?.status || null,
            notes: recordMap[emp._id.toString()]?.notes || ''
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance' });
    }
});

// POST mark attendance for an employee on a given date (upsert)
router.post('/attendance', async (req, res) => {
    try {
        const { employeeId, date, status, notes } = req.body;

        if (!employeeId || !date || !status) {
            return res.status(400).json({ success: false, message: 'employeeId, date and status are required' });
        }

        if (!['present', 'absent', 'leave'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const record = await Attendance.findOneAndUpdate(
            { employeeId, date },
            { status, notes: notes || '' },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: 'Server error marking attendance' });
    }
});

module.exports = router;
