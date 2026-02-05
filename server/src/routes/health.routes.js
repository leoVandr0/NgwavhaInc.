import express from 'express';
import {
    basicHealthCheck,
    databaseHealthCheck,
    authHealthCheck,
    paymentsHealthCheck,
    uploadsHealthCheck,
    fullHealthCheck
} from '../controllers/health.controller.js';

const router = express.Router();

router.get('/', basicHealthCheck);
router.get('/database', databaseHealthCheck);
router.get('/auth', authHealthCheck);
router.get('/payments', paymentsHealthCheck);
router.get('/uploads', uploadsHealthCheck);
router.get('/full', fullHealthCheck);

export default router;
