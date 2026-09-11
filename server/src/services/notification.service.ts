import { NotificationType, UserRole } from '@prisma/client';
import prisma from '../utils/prisma.js';

export class NotificationService {
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    return notification;
  }

  static async notifyManagers(type: NotificationType, title: string, message: string) {
    const managers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.OPERATIONS_MANAGER, UserRole.ADMIN] },
        isActive: true,
      },
      select: { id: true },
    });

    const notifications = managers.map((manager) =>
      prisma.notification.create({
        data: { userId: manager.id, type, title, message },
      })
    );

    await Promise.all(notifications);
  }

  static async notifyRole(role: string, type: NotificationType, title: string, message: string) {
    const users = await prisma.user.findMany({
      where: {
        role: role as UserRole,
        isActive: true,
      },
      select: { id: true },
    });

    await Promise.all(
      users.map((u) =>
        prisma.notification.create({
          data: { userId: u.id, type, title, message },
        })
      )
    );
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { message: 'Notification marked as read' };
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return count;
  }
}
