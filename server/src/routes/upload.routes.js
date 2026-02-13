import express from 'express';
import { r2Upload } from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { r2Config } from '../config/r2.js';

const router = express.Router();

// Upload course thumbnail
router.post('/course-thumbnail', protect, r2Upload.single('thumbnail'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if uploaded to R2 or local
        const isR2 = !!req.file.key;
        const filePath = isR2
            ? `${r2Config.publicDomain}/${req.file.key}`
            : `/uploads/${req.file.filename}`;

        const filename = isR2 ? req.file.key : req.file.filename;

        res.json({
            message: 'Thumbnail uploaded successfully',
            filePath,
            filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload thumbnail' });
    }
});

// Upload profile photo
router.post('/profile-photo', protect, r2Upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if uploaded to R2 or local
        const isR2 = !!req.file.key;
        const filePath = isR2
            ? `${r2Config.publicDomain}/${req.file.key}`
            : `/uploads/${req.file.filename}`;

        const filename = isR2 ? req.file.key : req.file.filename;

        res.json({
            message: 'Profile photo uploaded successfully',
            filePath,
            filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile photo' });
    }
});

export default router;
