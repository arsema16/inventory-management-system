import express from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// All authenticated users can view vehicles
router.get('/', VehicleController.getAllVehicles);
router.get('/:id', VehicleController.getVehicleById);

// Finance, Storekeeper, and Admin can manage vehicles
router.post(
  '/',
  authorize(UserRole.FINANCE, UserRole.STOREKEEPER, UserRole.ADMIN),
  validateBody(['vehicleId', 'make', 'model', 'sku']),
  logAudit('CREATE', 'Vehicle'),
  VehicleController.createVehicle
);

router.put(
  '/:id',
  authorize(UserRole.FINANCE, UserRole.STOREKEEPER, UserRole.ADMIN),
  logAudit('UPDATE', 'Vehicle'),
  VehicleController.updateVehicle
);

router.delete(
  '/:id',
  authorize(UserRole.FINANCE, UserRole.STOREKEEPER, UserRole.ADMIN),
  logAudit('DELETE', 'Vehicle'),
  VehicleController.deleteVehicle
);

export default router;
