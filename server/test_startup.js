try {
    console.log('Diagnostic: Starting server import...');
    import('./server.js').then(() => {
        console.log('Diagnostic: Server import successful!');
        // Give it a few seconds to try and listen
        setTimeout(() => {
            console.log('Diagnostic: Check if port 8080 is open...');
            process.exit(0);
        }, 5000);
    }).catch(err => {
        console.error('Diagnostic: Server failed to start:', err);
        process.exit(1);
    });
} catch (error) {
    console.error('Diagnostic: Synchronous error during import:', error);
    process.exit(1);
}
