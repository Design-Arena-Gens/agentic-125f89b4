import { Router } from 'express';
import {
  createPerformance,
  getMemberPerformance,
  listPerformance,
} from '../controllers/performanceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'INSTRUCTOR'), listPerformance);
router.post('/', requireRole('ADMIN', 'INSTRUCTOR'), createPerformance);
router.get('/member/:memberId', getMemberPerformance);

export default router;
