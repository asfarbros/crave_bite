const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const PerformanceNote = require('../models/PerformanceNote');
const { protect, authorize } = require('../middleware/auth');

const DEFAULT_SHIFT_START = '09:30';

// Admins and managers can view/manage day-to-day staff data.
// Some destructive/sensitive routes below add an extra authorize('admin') check.
router.use(protect, authorize('admin', 'manager'));

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

// DELETE an employee (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
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

        const data = employees.map((emp) => {
            const record = recordMap[emp._id.toString()];
            return {
                employee: emp,
                status: record?.status || null,
                notes: record?.notes || '',
                checkInTime: record?.checkInTime || '',
                late: record?.late || false
            };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance' });
    }
});

// POST mark attendance for an employee on a given date (upsert)
router.post('/attendance', async (req, res) => {
    try {
        const { employeeId, date, status, notes, checkInTime } = req.body;

        if (!employeeId || !date || !status) {
            return res.status(400).json({ success: false, message: 'employeeId, date and status are required' });
        }

        if (!['present', 'absent', 'leave'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let late = false;
        if (status === 'present' && checkInTime) {
            const shift = await Shift.findOne({ employeeId, date });
            const shiftStart = shift?.startTime || DEFAULT_SHIFT_START;
            late = checkInTime > shiftStart;
        }

        const record = await Attendance.findOneAndUpdate(
            { employeeId, date },
            { status, notes: notes || '', checkInTime: checkInTime || '', late },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: 'Server error marking attendance' });
    }
});

// GET monthly attendance analytics per employee (attendance %, late count)
router.get('/analytics/attendance', async (req, res) => {
    try {
        const { month } = req.query; // format: YYYY-MM
        if (!month) {
            return res.status(400).json({ success: false, message: 'month (YYYY-MM) is required' });
        }

        const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
        const records = await Attendance.find({ date: { $regex: `^${month}` } });

        const byEmployee = {};
        records.forEach((r) => {
            const key = r.employeeId.toString();
            if (!byEmployee[key]) byEmployee[key] = { present: 0, absent: 0, leave: 0, late: 0, marked: 0 };
            byEmployee[key][r.status] += 1;
            byEmployee[key].marked += 1;
            if (r.late) byEmployee[key].late += 1;
        });

        const data = employees.map((emp) => {
            const stats = byEmployee[emp._id.toString()] || { present: 0, absent: 0, leave: 0, late: 0, marked: 0 };
            const attendancePercent = stats.marked > 0 ? Math.round((stats.present / stats.marked) * 1000) / 10 : 0;
            return { employee: emp, ...stats, attendancePercent };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching attendance analytics:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance analytics' });
    }
});

// GET per-employee rating analytics from performance notes.
// Ratings are lifetime figures; `month` additionally reports that month's activity.
router.get('/analytics/performance', async (req, res) => {
    try {
        const { month } = req.query;

        let monthStart = null;
        let monthEnd = null;
        if (month) {
            const [year, mon] = month.split('-').map(Number);
            if (!year || !mon) {
                return res.status(400).json({ success: false, message: 'month must be in YYYY-MM format' });
            }
            monthStart = new Date(Date.UTC(year, mon - 1, 1));
            monthEnd = new Date(Date.UTC(year, mon, 1));
        }

        const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
        const notes = await PerformanceNote.find({ employeeId: { $in: employees.map((e) => e._id) } }).sort({ createdAt: -1 });

        const byEmployee = {};
        notes.forEach((n) => {
            const key = n.employeeId.toString();
            if (!byEmployee[key]) byEmployee[key] = { notes: [], ratings: [], monthRatings: [], distribution: [0, 0, 0, 0, 0] };
            const bucket = byEmployee[key];
            bucket.notes.push(n);

            if (n.rating) {
                bucket.ratings.push(n.rating);
                bucket.distribution[n.rating - 1] += 1;
                if (monthStart && n.createdAt >= monthStart && n.createdAt < monthEnd) {
                    bucket.monthRatings.push(n.rating);
                }
            }
        });

        const average = (values) =>
            values.length > 0 ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10 : null;

        const data = employees.map((emp) => {
            const bucket = byEmployee[emp._id.toString()] || { notes: [], ratings: [], monthRatings: [], distribution: [0, 0, 0, 0, 0] };
            const latest = bucket.notes[0];

            return {
                employee: emp,
                avgRating: average(bucket.ratings),
                ratingCount: bucket.ratings.length,
                noteCount: bucket.notes.length,
                distribution: bucket.distribution,
                monthAvgRating: average(bucket.monthRatings),
                monthRatingCount: bucket.monthRatings.length,
                latestNote: latest
                    ? { note: latest.note, rating: latest.rating || null, createdBy: latest.createdBy, createdAt: latest.createdAt }
                    : null
            };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching performance analytics:', error);
        res.status(500).json({ success: false, message: 'Server error fetching performance analytics' });
    }
});

module.exports = router;
