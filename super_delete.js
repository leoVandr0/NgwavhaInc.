import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/lenny/NgwavhaInc/server/src/database/package.json';

try {
    if (fs.existsSync(filePath)) {
        console.log('File exists. Attempting deletion...');
        // Try to change permissions if possible (read-only might be on)
        fs.chmodSync(filePath, 0o666);
        fs.unlinkSync(filePath);
        console.log('File deleted successfully.');
    } else {
        console.log('File does not exist.');
    }
} catch (err) {
    console.error('Error during deletion:', err.message);
}
