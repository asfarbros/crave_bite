const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

// GET payroll records for a given month
router.get('/', async (req, res) => {
    try {
        const { month } = req.query;
        const query = {};
        if (month) query.month = month;

        const records = await Payroll.find(query).populate('employeeId', 'name role avatar salaryType').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        console.error('Error fetching payroll records:', error);
        res.status(500).json({ success: false, message: 'Server error fetching payroll records' });
    }
});

// POST generate/regenerate a payroll record for an employee for a month (admin only)
router.post('/generate', authorize('admin'), async (req, res) => {
    try {
        const { employeeId, month, bonus, deductions } = req.body;

        if (!employeeId || !month) {
            return res.status(400).json({ success: false, message: 'employeeId and month (YYYY-MM) are required' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const records = await Attendance.find({ employeeId, date: { $regex: `^${month}` } });
        const presentDays = records.filter((r) => r.status === 'present').length;
        const absentDays = records.filter((r) => r.status === 'absent').length;
        const leaveDays = records.filter((r) => r.status === 'leave').length;

        const bonusAmount = bonus || 0;
        const deductionAmount = deductions || 0;

        let baseSalary = employee.baseSalary || 0;
        if (employee.salaryType === 'daily') {
            baseSalary = (employee.baseSalary || 0) * presentDays;
        }

        const netPay = baseSalary + bonusAmount - deductionAmount;

        const payroll = await Payroll.findOneAndUpdate(
            { employeeId, month },
            {
                baseSalary,
                presentDays,
                absentDays,
                leaveDays,
                bonus: bonusAmount,
                deductions: deductionAmount,
                netPay
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ success: false, message: 'Server error generating payroll' });
    }
});

// PUT mark a payroll record as paid (admin only)
router.put('/:id/pay', authorize('admin'), async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { status: 'paid', paidOn: new Date().toISOString().split('T')[0] },
            { new: true }
        );

        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        console.error('Error marking payroll as paid:', error);
        res.status(500).json({ success: false, message: 'Server error marking payroll as paid' });
    }
});

module.exports = router;
