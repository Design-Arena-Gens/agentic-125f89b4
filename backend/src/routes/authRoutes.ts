import { Router } from 'express';
import { z } from 'zod';
import { login } from '../controllers/authController.js';
import { validateBody } from '../utils/validator.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', validateBody(loginSchema), login);

export default router;
