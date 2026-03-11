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
        fileSize: 200 * 1024 * 1024 // 200MB max file size
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

// Map environment variables with multiple prefix support
const r2_endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || process.env.R2_ENDPOINT || '';
const r2_accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '';
const r2_secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '';
const r2_bucket = process.env.CLOUDFLARE_R2_BUCKET || process.env.R2_BUCKET_NAME || 'ngwavha';
const r2_publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || '';

// Export config
export const r2Config = {
    bucketName: r2_bucket,
    publicDomain: r2_publicDomain,
};

// R2 status for runtime checks via status endpoint
export const r2Status = {
    ready: false,
    bucketName: r2_bucket,
    publicDomain: r2_publicDomain,
    lastError: null
};

// R2 uploaders – fall back to local if R2 is not configured
// r2Upload      → thumbnails/  prefix  (course thumbnails)
// r2AvatarUpload → avatars/   prefix  (user profile photos)
let r2UploadInstance = multer({ storage: localStorage, fileFilter: fileFilter, limits: { fileSize: 200 * 1024 * 1024 } });
let r2AvatarUploadInstance = multer({ storage: localStorage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Export getters that will return the correct uploader based on initialization
export const r2Upload = () => r2UploadInstance;
export const r2AvatarUpload = () => r2AvatarUploadInstance;

// Try to initialize Cloudflare R2 uploaders and swap in if configured
const initializeR2Uploader = async () => {
    try {
        const hasR2 = r2_endpoint && r2_accessKey && r2_secretKey && r2_bucket;
        if (!hasR2) {
            console.warn('⚠️ Cloudflare R2 environment variables missing. Using local uploads for now.');
            return;
        }

        const { S3Client } = await import('@aws-sdk/client-s3');
        const multerS3Module = await import('multer-s3');
        const multerS3 = multerS3Module.default;
        const multerModule = await import('multer');
        const multerInstance = multerModule.default;

        const s3 = new S3Client({
            region: 'auto',
            endpoint: r2_endpoint,
            credentials: {
                accessKeyId: r2_accessKey,
                secretAccessKey: r2_secretKey
            }
        });

        // Storage for course thumbnails
        const storageThumbnail = multerS3({
            s3,
            bucket: r2_bucket,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `thumbnails/${file.fieldname}-${uuidv4()}${ext}`);
            }
        });

        // Storage for user avatars
        const storageAvatar = multerS3({
            s3,
            bucket: r2_bucket,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `avatars/${file.fieldname}-${uuidv4()}${ext}`);
            }
        });

        // Swap in R2 uploaders
        r2UploadInstance = multerInstance({ storage: storageThumbnail, fileFilter: fileFilter, limits: { fileSize: 200 * 1024 * 1024 } });
        r2AvatarUploadInstance = multerInstance({ storage: storageAvatar, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

        // Update runtime status
        r2Status.ready = true;
        r2Status.bucketName = r2_bucket;
        r2Status.publicDomain = r2_publicDomain;
        r2Status.lastError = null;
        console.log('✅ Cloudflare R2 uploaders initialized (thumbnails/ + avatars/)');
    } catch (e) {
        console.warn('⚠️ Could not initialize R2 uploader:', e?.message);
        r2Status.ready = false;
        r2Status.lastError = e?.message;
    }
};
// Help function to get public URL for a file (used by manually calling controllers)
export const uploadToR2 = async (file) => {
    if (!file) return null;

    // If file has a key, it's already in R2
    if (file.key && r2Config.publicDomain) {
        return `${r2Config.publicDomain}/${file.key}`;
    }

    // Fallback to local path
    return `/uploads/${file.filename}`;
};

// Upload video file to R2 (for chunked uploads)
export const uploadVideoToR2 = async (filePath, fileName) => {
    try {
        // Check if R2 is configured
        const hasR2 = r2_endpoint && r2_accessKey && r2_secretKey && r2_bucket;
        if (!hasR2) {
            console.warn('⚠️ R2 not configured. Video will remain in local storage.');
            return { success: false, localPath: filePath };
        }

        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        const { createReadStream } = await import('fs');
        const { lookup } = await import('mime-types');

        const s3 = new S3Client({
            region: 'auto',
            endpoint: r2_endpoint,
            credentials: {
                accessKeyId: r2_accessKey,
                secretAccessKey: r2_secretKey
            }
        });

        // Generate unique key for video
        const ext = path.extname(fileName) || '.mp4';
        const key = `videos/${uuidv4()}${ext}`;

        // Read file and upload
        const fileStream = createReadStream(filePath);
        const contentType = lookup(filePath) || 'video/mp4';

        const command = new PutObjectCommand({
            Bucket: r2_bucket,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
        });

        await s3.send(command);

        const publicUrl = r2_publicDomain
            ? `${r2_publicDomain}/${key}`
            : `${r2_endpoint}/${r2_bucket}/${key}`;

        console.log('✅ Video uploaded to R2:', publicUrl);
        return { success: true, url: publicUrl, key };

    } catch (error) {
        console.error('❌ Failed to upload video to R2:', error.message);
        return { success: false, localPath: filePath, error: error.message };
    }
};

initializeR2Uploader();
