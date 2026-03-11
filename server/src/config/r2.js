let r2Client = null;

// Configuration with fallback values
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://d6ebc945bb7b5957a857265c8c2c5e79.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'c99f543f65ec46528e8ec0d72c0af40c';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'c94d53064562d7c8e98b8eb2de2e84e248553382d7ab7f889e7c8a4fb13b9f41';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ngwavha';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-d6ebc945bb7b5957a857265c8c2c5e79.r2.dev';

// Initialize client with top-level await (Node.js ESM)
try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    
    // Check if all required environment variables are present
    if (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT) {
        r2Client = new S3Client({
            region: 'auto',
            endpoint: R2_ENDPOINT,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });
        console.log('✅ Cloudflare R2 client initialized successfully');
    } else {
        console.warn('⚠️ R2 credentials missing. Please check environment variables.');
    }
} catch (error) {
    console.warn('⚠️ Cloudflare R2 client initialization failed:', error.message);
}

export const r2Config = {
    bucketName: R2_BUCKET_NAME,
    publicDomain: R2_PUBLIC_URL,
};

export default r2Client;
