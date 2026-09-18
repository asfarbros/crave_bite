const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.use(protect, authorize('admin', 'manager'));

// GET documents for an employee
router.get('/', async (req, res) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'employeeId is required' });
        }

        const employee = await Employee.findById(employeeId).select('documents');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.status(200).json({ success: true, data: employee.documents });
    } catch (error) {
        console.error('Error fetching staff documents:', error);
        res.status(500).json({ success: false, message: 'Server error fetching staff documents' });
    }
});

// POST upload a document (ID proof, contract, etc.) for an employee
router.post('/', async (req, res) => {
    try {
        const { employeeId, title, fileBase64 } = req.body;

        if (!employeeId || !title || !fileBase64) {
            return res.status(400).json({ success: false, message: 'employeeId, title and fileBase64 are required' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
            folder: 'cravebite_staff_docs',
            resource_type: 'auto'
        });

        employee.documents.push({
            title,
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
        });
        await employee.save();

        res.status(201).json({ success: true, data: employee.documents[employee.documents.length - 1] });
    } catch (error) {
        console.error('Error uploading staff document:', error);
        res.status(500).json({ success: false, message: 'Server error uploading staff document' });
    }
});

// DELETE a document from an employee (admin only)
router.delete('/:employeeId/:docId', authorize('admin'), async (req, res) => {
    try {
        const { employeeId, docId } = req.params;
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const doc = employee.documents.id(docId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'auto' });
        doc.deleteOne();
        await employee.save();

        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff document:', error);
        res.status(500).json({ success: false, message: 'Server error deleting staff document' });
    }
});

module.exports = router;
