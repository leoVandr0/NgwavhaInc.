import express from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload course thumbnail
router.post('/course-thumbnail', authenticate, upload.single('thumbnail'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the file path relative to uploads directory
        const filePath = `/uploads/${req.file.filename}`;

        res.json({
            message: 'Thumbnail uploaded successfully',
            filePath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload thumbnail' });
    }
});

// Upload profile photo
router.post('/profile-photo', authenticate, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the file path relative to uploads directory
        const filePath = `/uploads/${req.file.filename}`;

        res.json({
            message: 'Profile photo uploaded successfully',
            filePath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile photo' });
    }
});

export default router;
