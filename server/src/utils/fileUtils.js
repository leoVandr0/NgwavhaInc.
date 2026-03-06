import fs from 'fs';
import path from 'path';

/**
 * Delete a file from the server
 * @param {string} filePath - The path to the file (e.g., /uploads/image.png)
 */
export const deleteFile = (filePath) => {
    if (!filePath) return;

    try {
        // Resolve path relative to project root
        // filePath usually starts with /uploads/
        const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const absolutePath = path.resolve(process.cwd(), relativePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`🗑️ Deleted file: ${absolutePath}`);
        } else {
            console.warn(`⚠️ File not found for deletion: ${absolutePath}`);
        }
    } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error.message);
    }
};
