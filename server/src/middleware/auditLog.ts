import type { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';

export const logAudit = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store audit details for later logging
    res.on('finish', async () => {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const entityId = req.params.id || req.body?.id || 'unknown';

          await prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action,
              entity,
              entityId,
              details: {
                method: req.method,
                path: req.path,
                body: req.body,
                params: req.params,
              },
            },
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
    });

    next();
  };
};
