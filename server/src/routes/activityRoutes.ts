import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorizeAdmin);
router.get('/', getActivityLogs);

export default router;
