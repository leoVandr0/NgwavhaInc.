const file = 'c:/Users/lenny/NgwavhaInc/server/src/database/package.json';

try {
    if (fs.existsSync(file)) {
        fs.rmSync(file, { force: true });
        console.log('File deleted with rmSync');
    } else {
        console.log('File already gone');
    }
} catch (err) {
    console.error('CRITICAL ERROR:', err.message);
}

