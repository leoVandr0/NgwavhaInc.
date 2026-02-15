import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client, { r2Config } from '../config/r2.js';
// import logger from './dbLogger.js'; // Temporarily disabled

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - The name of the file
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToR2 = async (fileBuffer, fileName, contentType) => {
    if (!r2Client) {
        console.warn('⚠️ R2 client not available, falling back to local filename');
        return fileName; // Return filename for local storage fallback
    }

    try {
        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Return the CDN URL
        const publicUrl = `${r2Config.publicDomain}/${fileName}`;
        console.log('✅ File uploaded to R2:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('❌ R2 upload failed:', error.message);
        // logger.error('Storage', `R2 upload failed: ${error.message}`, { fileName });
        throw error;
    }
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} fileName - The name of the file to delete
 */
export const deleteFromR2 = async (fileName) => {
    if (!r2Client) {
        console.warn('⚠️ R2 client not available, skipping file deletion');
        return;
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: r2Config.bucketName,
            Key: fileName,
        });

        await r2Client.send(command);
        console.log('✅ File deleted from R2:', fileName);
    } catch (error) {
        console.error('❌ R2 deletion failed:', error.message);
        // logger.error('Storage', `R2 deletion failed: ${error.message}`, { fileName });
        // Don't throw to prevent breaking workflows
    }
};

export const storage = {
    upload: uploadToR2,
    delete: deleteFromR2
};

export default storage;
