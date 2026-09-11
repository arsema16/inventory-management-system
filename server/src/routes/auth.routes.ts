import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../utils/validators.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(['firstName', 'lastName', 'email', 'password']),
  AuthController.register
);

router.post('/login', validateBody(['email', 'password']), AuthController.login);

router.get('/profile', authenticate, AuthController.getProfile);

export default router;
