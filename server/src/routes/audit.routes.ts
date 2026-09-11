import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import prisma from '../utils/prisma.js';
import { UserRole } from '@prisma/client';

const router = express.Router();
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', entity, action } = req.query as Record<string, string>;

  const where: any = {};
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({ success: true, data: logs, total, page: parseInt(page), limit: parseInt(limit) });
}));

export default router;
