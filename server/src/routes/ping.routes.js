import express from 'express';

const router = express.Router();

// Simple test route
router.get('/ping', (req, res) => {
    res.json({ 
        message: 'pong',
        timestamp: new Date().toISOString(),
        routes: ['/api/db/ping', '/api/db/test', '/api/db/force-create']
    });
});

export default router;
