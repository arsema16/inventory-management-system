import { RequestType, RequestStatus, StockMovementType } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';
import { NotificationService } from './notification.service.js';

export class RequestService {
  static async getAllRequests(filters?: {
    status?: RequestStatus;
    type?: RequestType;
    requestedById?: string;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.requestedById) where.requestedById = filters.requestedById;

    const requests = await prisma.request.findMany({
      where,
      include: {
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
          },
        },
        items: {
          include: {
            item: {
              select: { id: true, name: true, sku: true, unit: true },
            },
          },
        },
        approvals: {
          include: {
            approvedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  static async getRequestById(id: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: { select: { name: true } },
          },
        },
        items: {
          include: {
            item: true,
          },
        },
        approvals: {
          include: {
            approvedBy: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    return request;
  }

  static async createRequest(
    userId: string,
    data: {
      type: RequestType;
      reason?: string;
      items: Array<{ itemId: string; quantity: number; notes?: string }>;
    }
  ) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('Request must include at least one item', 400);
    }

    // Verify all items exist
    for (const item of data.items) {
      const exists = await prisma.item.findUnique({
        where: { id: item.itemId },
      });

      if (!exists) {
        throw new AppError(`Item with ID ${item.itemId} not found`, 404);
      }

      if (item.quantity <= 0) {
        throw new AppError('Item quantity must be greater than 0', 400);
      }
    }

    // Generate request number
    const count = await prisma.request.count();
    const requestNumber = `REQ-${(count + 1).toString().padStart(6, '0')}`;

    const request = await prisma.request.create({
      data: {
        requestNumber,
        type: data.type,
        reason: data.reason,
        requestedById: userId,
        status: RequestStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Notify managers
    await NotificationService.notifyManagers(
      'REQUEST',
      'New Request',
      `New request ${requestNumber} requires approval`
    );

    return request;
  }

  static async approveRequest(requestId: string, approverId: string, comments?: string) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { items: true },
    });

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new AppError('Only pending requests can be approved', 400);
    }

    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approvedAt: new Date(),
        },
      }),
      prisma.approval.create({
        data: {
          requestId,
          approvedById: approverId,
          status: 'APPROVED',
          comments,
        },
      }),
    ]);

    await NotificationService.createNotification(
      request.requestedById,
      'APPROVAL',
      'Request Approved',
      `Your request ${request.requestNumber} has been approved`
    );

    // Also notify all storekeepers so they can fulfil it
    await NotificationService.notifyRole(
      'STOREKEEPER',
      'REQUEST',
      'Request Ready to Fulfil',
      `Request ${request.requestNumber} has been approved and is waiting for fulfilment`
    );

    return await this.getRequestById(requestId);
  }

  static async rejectRequest(requestId: string, approverId: string, reason: string) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new AppError('Only pending requests can be rejected', 400);
    }

    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.REJECTED,
          rejectionReason: reason,
        },
      }),
      prisma.approval.create({
        data: {
          requestId,
          approvedById: approverId,
          status: 'REJECTED',
          rejectionReason: reason,
        },
      }),
    ]);

    await NotificationService.createNotification(
      request.requestedById,
      'REJECTION',
      'Request Rejected',
      `Your request ${request.requestNumber} has been rejected`
    );

    return await this.getRequestById(requestId);
  }

  static async fulfillRequest(requestId: string, userId: string) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { items: { include: { item: true } } },
    });

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.status !== RequestStatus.APPROVED) {
      throw new AppError('Only approved requests can be fulfilled', 400);
    }

    // Check stock availability and create stock movements
    const stockMovements: any[] = [];

    for (const requestItem of request.items) {
      if (requestItem.item.quantity < requestItem.quantity) {
        throw new AppError(`Insufficient stock for item: ${requestItem.item.name}`, 400);
      }

      stockMovements.push({
        itemId: requestItem.itemId,
        userId,
        type: StockMovementType.OUT,
        quantity: requestItem.quantity,
        previousQty: requestItem.item.quantity,
        newQty: requestItem.item.quantity - requestItem.quantity,
        reference: request.requestNumber,
        notes: `Fulfilled request ${request.requestNumber}`,
      });
    }

    await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.FULFILLED,
          fulfilledAt: new Date(),
        },
      });

      // Update item quantities and create stock movements
      for (const movement of stockMovements) {
        await tx.item.update({
          where: { id: movement.itemId },
          data: { quantity: movement.newQty },
        });

        await tx.stockMovement.create({
          data: movement,
        });
      }

      // Update request items issued quantity
      for (const requestItem of request.items) {
        await tx.requestItem.update({
          where: { id: requestItem.id },
          data: { issuedQty: requestItem.quantity },
        });
      }
    });

    await NotificationService.createNotification(
      request.requestedById,
      'INVENTORY',
      'Request Fulfilled',
      `Your request ${request.requestNumber} has been fulfilled and items are ready for pickup`
    );

    // Notify managers that the request was fulfilled
    await NotificationService.notifyManagers(
      'INVENTORY',
      'Request Fulfilled',
      `Request ${request.requestNumber} has been fulfilled by the storekeeper`
    );

    return await this.getRequestById(requestId);
  }
}
