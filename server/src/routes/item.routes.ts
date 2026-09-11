import express from 'express';
import { ItemController } from '../controllers/item.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';
import { validateBody } from '../utils/validators.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// All authenticated users can view items
router.get('/', ItemController.getAllItems);
router.get('/low-stock', ItemController.getLowStockItems);
router.get('/:id', ItemController.getItemById);

// Storekeeper and Admin can manage items
router.post(
  '/',
  authorize(UserRole.STOREKEEPER, UserRole.ADMIN),
  validateBody(['name', 'sku']),
  logAudit('CREATE', 'Item'),
  ItemController.createItem
);

router.put(
  '/:id',
  authorize(UserRole.STOREKEEPER, UserRole.ADMIN),
  logAudit('UPDATE', 'Item'),
  ItemController.updateItem
);

router.delete(
  '/:id',
  authorize(UserRole.STOREKEEPER, UserRole.ADMIN),
  logAudit('DELETE', 'Item'),
  ItemController.deleteItem
);

router.post(
  '/:id/restock',
  authorize(UserRole.STOREKEEPER, UserRole.ADMIN),
  validateBody(['quantity']),
  logAudit('RESTOCK', 'Item'),
  ItemController.restockItem
);

router.get(
  '/:id/movements',
  ItemController.getStockMovements
);

export default router;
