import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Change own password (any authenticated user)
router.put(
  '/change-password',
  validateBody(['oldPassword', 'newPassword']),
  logAudit('CHANGE_PASSWORD', 'User'),
  UserController.changePassword
);

// Admin only routes
router.get('/', authorize(UserRole.ADMIN), UserController.getAllUsers);

router.get('/:id', authorize(UserRole.ADMIN), UserController.getUserById);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateBody(['firstName', 'lastName', 'email', 'password', 'role']),
  logAudit('CREATE', 'User'),
  UserController.createUser
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  logAudit('UPDATE', 'User'),
  UserController.updateUser
);

router.delete('/:id', authorize(UserRole.ADMIN), logAudit('DELETE', 'User'), UserController.deleteUser);

export default router;
