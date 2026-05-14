import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import {
    submitComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaint
} from '../controllers/complaint.controller.js';

const router = Router();

router.use(protect);

router.post('/', submitComplaint);
router.get('/my', getMyComplaints);
router.get('/', adminOnly, getAllComplaints);
router.put('/:id', adminOnly, updateComplaint);

export default router;
