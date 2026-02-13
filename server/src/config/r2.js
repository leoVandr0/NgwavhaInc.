let r2Client = null;

const createR2Client = async () => {
    try {
        const { S3Client } = await import('@aws-sdk/client-s3');
        r2Client = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKey_id: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
        return r2Client;
    } catch (error) {
        console.warn('⚠️ Cloudflare R2 client initialization failed: @aws-sdk/client-s3 not found. Falling back to local storage.');
        return null;
    }
};

// Initialize client
createR2Client();

export const r2Config = {
    bucketName: process.env.R2_BUCKET_NAME,
    publicDomain: process.env.R2_PUBLIC_DOMAIN,
};

export default r2Client;
