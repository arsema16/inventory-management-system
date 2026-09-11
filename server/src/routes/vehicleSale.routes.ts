import express from 'express';
import { VehicleSaleController } from '../controllers/vehicleSale.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// All authenticated users can view sales
router.get('/', VehicleSaleController.getAllSales);
router.get('/:id', VehicleSaleController.getSaleById);

// Finance can create sales
router.post(
  '/',
  authorize(UserRole.FINANCE, UserRole.ADMIN),
  validateBody(['vehicleId', 'client', 'salePrice']),
  logAudit('CREATE', 'VehicleSale'),
  VehicleSaleController.createSale
);

// Operations Manager and Admin can approve/reject sales
router.post(
  '/:id/approve',
  authorize(UserRole.OPERATIONS_MANAGER, UserRole.ADMIN),
  logAudit('APPROVE', 'VehicleSale'),
  VehicleSaleController.approveSale
);

router.post(
  '/:id/reject',
  authorize(UserRole.OPERATIONS_MANAGER, UserRole.ADMIN),
  validateBody(['reason']),
  logAudit('REJECT', 'VehicleSale'),
  VehicleSaleController.rejectSale
);

// Finance and Admin can complete sales
router.post(
  '/:id/complete',
  authorize(UserRole.FINANCE, UserRole.ADMIN),
  logAudit('COMPLETE', 'VehicleSale'),
  VehicleSaleController.completeSale
);

export default router;
