let r2Client = null;

// Initialize client with top-level await (Node.js ESM)
try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    
    // Check if all required environment variables are present
    if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT) {
        r2Client = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
    bucketName: process.env.R2_BUCKET_NAME || 'ngwavha',
    publicDomain: process.env.R2_PUBLIC_URL || 'https://pub-d6ebc945bb7b5957a857265c8c2c5e79.r2.dev/ngwavha',
};

export default r2Client;
