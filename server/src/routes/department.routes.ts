import express from 'express';
import { DepartmentController } from '../controllers/department.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// All users can view departments
router.get('/', DepartmentController.getAllDepartments);
router.get('/:id', DepartmentController.getDepartmentById);

// Admin only
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateBody(['name']),
  logAudit('CREATE', 'Department'),
  DepartmentController.createDepartment
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateBody(['name']),
  logAudit('UPDATE', 'Department'),
  DepartmentController.updateDepartment
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  logAudit('DELETE', 'Department'),
  DepartmentController.deleteDepartment
);

export default router;
