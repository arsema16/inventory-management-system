import express from 'express';
import { RequestController } from '../controllers/request.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// All authenticated users can create requests and view their own
router.get('/', RequestController.getAllRequests);
router.get('/:id', RequestController.getRequestById);
router.post(
  '/',
  validateBody(['type', 'items']),
  logAudit('CREATE', 'Request'),
  RequestController.createRequest
);

// Managers and Admin can approve/reject requests
router.post(
  '/:id/approve',
  authorize(UserRole.OPERATIONS_MANAGER, UserRole.ADMIN),
  logAudit('APPROVE', 'Request'),
  RequestController.approveRequest
);

router.post(
  '/:id/reject',
  authorize(UserRole.OPERATIONS_MANAGER, UserRole.ADMIN),
  validateBody(['reason']),
  logAudit('REJECT', 'Request'),
  RequestController.rejectRequest
);

// Storekeeper can fulfill approved requests
router.post(
  '/:id/fulfill',
  authorize(UserRole.STOREKEEPER, UserRole.ADMIN),
  logAudit('FULFILL', 'Request'),
  RequestController.fulfillRequest
);

export default router;
