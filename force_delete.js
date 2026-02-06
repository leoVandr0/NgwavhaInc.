import fs from 'fs';

const path = 'c:/Users/lenny/NgwavhaInc/server/src/database/package.json';

try {
    if (fs.existsSync(path)) {
        console.log('File found. Size:', fs.statSync(path).size);
        // Try to truncate first to break parsing even if deletion fails
        fs.writeFileSync(path, '');
        console.log('File truncated.');
        fs.unlinkSync(path);
        console.log('File deleted successfully.');
    } else {
        console.log('File not found, it might already be gone.');
    }
} catch (err) {
    console.error('Error during forced deletion:', err.message);
}
