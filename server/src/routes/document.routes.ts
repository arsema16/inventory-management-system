import express from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.js';
import { logAudit } from '../middleware/auditLog.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);

// Get documents for a sale
router.get('/sale/:saleId', DocumentController.getDocumentsBySale);

// Upload document (Finance and Admin)
router.post(
  '/sale/:saleId/upload',
  authorize(UserRole.FINANCE, UserRole.ADMIN, UserRole.OPERATIONS_MANAGER),
  uploadDocument.single('file'),
  logAudit('UPLOAD', 'Document'),
  DocumentController.uploadDocument
);

// Download document
router.get('/:id/download', DocumentController.downloadDocument);

// Delete document (Finance and Admin)
router.delete(
  '/:id',
  authorize(UserRole.FINANCE, UserRole.ADMIN),
  logAudit('DELETE', 'Document'),
  DocumentController.deleteDocument
);

export default router;
