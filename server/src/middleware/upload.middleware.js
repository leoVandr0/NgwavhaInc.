import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

function checkFileType(file, cb) {
    // Allow common image formats and increase size limit for avatars
    const filetypes = /jpg|jpeg|png|gif|webp|pdf|mp4|mkv|avi|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images (JPG, PNG, GIF, WebP), PDFs and Videos only!'));
    }
}

export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for avatars
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
