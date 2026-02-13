import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import r2Client, { r2Config } from '../config/r2.js';

let multerS3 = null;
try {
    multerS3 = (await import('multer-s3')).default;
} catch (error) {
    console.warn('⚠️ multer-s3 not found. R2 uploads will fallback to local storage.');
}

const uploadPath = process.env.UPLOAD_PATH || 'uploads';
const chunkPath = process.env.UPLOAD_CHUNK_PATH || path.join(uploadPath, 'chunks');
fs.mkdirSync(uploadPath, { recursive: true });
fs.mkdirSync(chunkPath, { recursive: true });

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`
        );
    },
});

// R2 Storage configuration (only if multerS3 is available)
let r2Storage = null;
if (multerS3 && r2Client && r2Config.bucketName) {
    r2Storage = multerS3({
        s3: r2Client,
        bucket: r2Config.bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`);
        }
    });
} else {
    if (multerS3 && (!r2Client || !r2Config.bucketName)) {
        console.warn('⚠️ R2 Storage skipped: Missing R2 Client or Bucket Name. Falling back to local storage.');
    }
}

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|gif|webp|pdf|mp4|mkv|avi|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images (JPG, PNG, GIF, WebP), PDFs and Videos only!'));
    }
}

// Local upload (fallback/internal)
export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Cloudflare R2 Upload (or fallback to local if R2 storage is not available)
export const r2Upload = multer({
    storage: r2Storage || storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for R2
});

const chunkStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, chunkPath);
    },
    filename(req, file, cb) {
        const { uploadId, chunkIndex } = req.body;
        cb(null, `${uploadId}-${chunkIndex}`);
    }
});

export const chunkUpload = multer({
    storage: chunkStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
