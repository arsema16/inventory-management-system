import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class NotificationController {
  static getUserNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { unreadOnly } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      req.user!.id,
      unreadOnly === 'true'
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.markAsRead(String(req.params["id"]), req.user!.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  static markAllAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.markAllAsRead(req.user!.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  static getUnreadCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const count = await NotificationService.getUnreadCount(req.user!.id);

    res.status(200).json({
      success: true,
      data: { count },
    });
  });
}
