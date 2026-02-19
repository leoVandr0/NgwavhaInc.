import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadPath = process.env.UPLOAD_PATH || 'uploads';
const chunkPath = process.env.UPLOAD_CHUNK_PATH || path.join(uploadPath, 'chunks');

// Ensure upload directories exist
    try {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    if (!fs.existsSync(chunkPath)) {
        fs.mkdirSync(chunkPath, { recursive: true });
    }
    console.log('✅ Upload directories ready:', uploadPath);
} catch (error) {
    console.error('❌ Failed to create upload directories:', error.message);
}

// Local disk storage configuration
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter function
function fileFilter(req, file, cb) {
    // Allowed image types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    // Allowed document types
    const allowedDocTypes = ['application/pdf'];
    // Allowed video types
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    const isImage = allowedImageTypes.includes(file.mimetype);
    const isDocument = allowedDocTypes.includes(file.mimetype);
    const isVideo = allowedVideoTypes.includes(file.mimetype);

    if (isImage || isDocument || isVideo) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: images (jpg, png, gif, webp), PDFs, and videos (mp4, webm)`), false);
    }
}

// Standard upload middleware (local storage)
export const upload = multer({
    storage: localStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    }
});

// Chunk storage for large video uploads
const chunkStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, chunkPath);
    },
    filename: function (req, file, cb) {
        const { uploadId, chunkIndex } = req.body;
        cb(null, `${uploadId}-${chunkIndex}`);
    }
});

export const chunkUpload = multer({
    storage: chunkStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB chunks
});

// R2 upload function (optional - for future use)
export const uploadToR2 = async (file) => {
    // Placeholder for R2 upload logic
    // Currently just returns local path
    return `/uploads/${file.filename}`;
};

// Export config
export const r2Config = {
    bucketName: process.env.R2_BUCKET_NAME || 'ngwavha',
    publicDomain: process.env.R2_PUBLIC_URL || '',
};

// R2 status for runtime checks via status endpoint
export const r2Status = {
  ready: false,
  bucketName: process.env.R2_BUCKET_NAME || 'ngwavha',
  publicDomain: process.env.R2_PUBLIC_URL || '',
  lastError: null
};

// R2 uploader (will be swapped to R2 storage when available)
export let r2Upload = multer({ storage: localStorage, fileFilter: fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// Try to initialize Cloudflare R2 uploader and swap in if configured
const initializeR2Uploader = async () => {
  try {
    const hasR2 = process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME;
    if (!hasR2) {
      console.warn('⚠️ R2 environment variables missing. Using local uploads for now.');
      return;
    }
    const { S3Client } = await import('@aws-sdk/client-s3');
    const multerS3Module = await import('multer-s3');
    const multerS3 = multerS3Module.default;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
      }
    });

    const bucketName = process.env.R2_BUCKET_NAME || 'ngwavha';
    const storageR2 = multerS3({
      s3,
      bucket: bucketName,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `thumbnails/${file.fieldname}-${uuidv4()}${ext}`);
      }
    });

    // Swap in R2 uploader
    r2Upload = require('multer')({ storage: storageR2, fileFilter: fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
    // Update runtime status
    r2Status.ready = true;
    r2Status.bucketName = bucketName;
    r2Status.publicDomain = process.env.R2_PUBLIC_URL || '';
    r2Status.lastError = null;
    // Update runtime status
    r2Status.ready = true;
    r2Status.bucketName = bucketName;
    r2Status.publicDomain = process.env.R2_PUBLIC_URL || '';
    console.log('✅ Cloudflare R2 uploader initialized and active');
    } catch (e) {
    console.warn('⚠️ Could not initialize R2 uploader:', e?.message);
    r2Status.ready = false;
    r2Status.lastError = e?.message;
  }
};
initializeR2Uploader();
