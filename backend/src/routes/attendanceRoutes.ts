import { Router } from 'express';
import {
  bulkUpsertAttendance,
  getAttendance,
  getMemberAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'INSTRUCTOR'), getAttendance);
router.post('/bulk', requireRole('ADMIN', 'INSTRUCTOR'), bulkUpsertAttendance);
router.get('/member/:memberId', getMemberAttendance);

export default router;
