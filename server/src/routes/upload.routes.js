import express from 'express';
import { upload, r2Upload, r2Config, r2Status } from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Simple local upload - works reliably (R2 will be used if configured)
router.post('/course-thumbnail', protect, r2Upload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        console.log('📁 File uploaded:', {
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        // Determine path depending on storage backend
        const isR2 = !!req.file.key;
        const filePath = isR2 && r2Config?.publicDomain
            ? `${r2Config.publicDomain}/${req.file.key}`
            : `/uploads/${req.file.filename}`;
        const filename = isR2 ? req.file.key : req.file.filename;
        res.json({
            success: true,
            message: 'Thumbnail uploaded successfully',
            filePath,
            filename
        });
    } catch (error) {
        console.error('❌ Upload error:', error?.stack || error);
        // Build robust error payload
        const isProduction = process.env.NODE_ENV === 'production';
        const code = error?.code || 'UPLOAD_ERROR';
        let message = error?.message || 'Failed to upload thumbnail';
        let detail = error?.message || error?.toString() || 'Unknown error';
        let status = 500;

        // Common known errors
        if (code === 'LIMIT_FILE_SIZE') {
            status = 413;
            message = 'File too large';
            detail = 'Maximum allowed size exceeded for the upload';
        } else if (code === 'UNSUPPORTED_FILE_TYPE') {
            status = 415;
            message = 'Unsupported file type';
            detail = 'Allowed: images (jpg, jpeg, png, gif, webp), PDFs, videos (mp4, webm, mov)';
        }

        res.status(status).json({ 
            success: false,
            message: isProduction ? 'Upload failed' : message,
            error: {
                code,
                detail: isProduction ? detail : detail,
                retryHint: 'If the problem persists, try uploading the file again. If R2 is down, check /api/upload/status for readiness.'
            }
        });
    }
});

// Test upload endpoint (no auth required - for debugging)
router.post('/test', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'Test upload successful',
            file: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Test upload failed',
            error: error.message
        });
    }
});

// Upload profile photo
router.post('/profile-photo', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        const filePath = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            filePath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to upload profile photo',
            error: error.message 
        });
    }
});

// Status endpoint to report R2 readiness and config
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            r2Ready: Boolean(r2Status?.ready),
            bucketName: r2Status?.bucketName,
            publicDomain: r2Status?.publicDomain,
            lastError: r2Status?.lastError
        }
    });
});

export default router;
