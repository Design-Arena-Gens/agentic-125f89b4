import { Router } from 'express';
import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from '../controllers/memberController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listMembers);
router.post('/', requireRole('ADMIN', 'INSTRUCTOR'), createMember);
router.get('/:id', getMember);
router.put('/:id', requireRole('ADMIN', 'INSTRUCTOR'), updateMember);
router.delete('/:id', requireRole('ADMIN'), deleteMember);

export default router;
