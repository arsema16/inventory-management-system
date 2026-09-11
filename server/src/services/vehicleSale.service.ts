import { SaleStatus, VehicleStatus } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';
import { NotificationService } from './notification.service.js';

export class VehicleSaleService {
  static async getAllSales(filters?: { status?: SaleStatus; vehicleId?: string }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.vehicleId) where.vehicleId = filters.vehicleId;

    const sales = await prisma.vehicleSale.findMany({
      where,
      include: {
        vehicle: {
          include: {
            item: {
              select: { name: true },
            },
          },
        },
        client: true,
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            createdAt: true,
          },
        },
        approvals: {
          include: {
            approvedBy: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales;
  }

  static async getSaleById(id: string) {
    const sale = await prisma.vehicleSale.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            item: true,
          },
        },
        client: true,
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        approvals: {
          include: {
            approvedBy: {
              select: { firstName: true, lastName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    return sale;
  }

  static async createSale(
    userId: string,
    data: {
      vehicleId: string;
      client: {
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
        address?: string;
        idNumber?: string;
      };
      salePrice: number;
      paymentReference?: string;
      notes?: string;
    }
  ) {
    // Verify vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new AppError('Vehicle is not available for sale', 400);
    }

    // Generate sale number
    const count = await prisma.vehicleSale.count();
    const saleNumber = `SALE-${(count + 1).toString().padStart(6, '0')}`;

    // Create or find client
    let client = await prisma.client.findFirst({
      where: {
        firstName: data.client.firstName,
        lastName: data.client.lastName,
        ...(data.client.idNumber && { idNumber: data.client.idNumber }),
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: data.client,
      });
    }

    // Create sale and update vehicle status
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.vehicleSale.create({
        data: {
          saleNumber,
          vehicleId: data.vehicleId,
          clientId: client!.id,
          submittedById: userId,
          salePrice: data.salePrice,
          paymentReference: data.paymentReference,
          notes: data.notes,
          status: SaleStatus.PENDING,
        },
        include: {
          vehicle: true,
          client: true,
        },
      });

      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: VehicleStatus.RESERVED },
      });

      return newSale;
    });

    // Notify managers
    await NotificationService.notifyManagers(
      'VEHICLE_SALE',
      'New Vehicle Sale',
      `New vehicle sale ${saleNumber} requires approval`
    );

    return sale;
  }

  static async approveSale(saleId: string, approverId: string, comments?: string) {
    const sale = await prisma.vehicleSale.findUnique({
      where: { id: saleId },
      include: { vehicle: true },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status !== SaleStatus.PENDING) {
      throw new AppError('Only pending sales can be approved', 400);
    }

    await prisma.$transaction([
      prisma.vehicleSale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.APPROVED,
          approvedAt: new Date(),
        },
      }),
      prisma.approval.create({
        data: {
          saleId,
          approvedById: approverId,
          status: 'APPROVED',
          comments,
        },
      }),
    ]);

    await NotificationService.createNotification(
      sale.submittedById,
      'APPROVAL',
      'Sale Approved',
      `Vehicle sale ${sale.saleNumber} has been approved`
    );

    return await this.getSaleById(saleId);
  }

  static async rejectSale(saleId: string, approverId: string, reason: string) {
    const sale = await prisma.vehicleSale.findUnique({
      where: { id: saleId },
      include: { vehicle: true },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status !== SaleStatus.PENDING) {
      throw new AppError('Only pending sales can be rejected', 400);
    }

    await prisma.$transaction([
      prisma.vehicleSale.update({
        where: { id: saleId },
        data: { status: SaleStatus.REJECTED },
      }),
      prisma.approval.create({
        data: {
          saleId,
          approvedById: approverId,
          status: 'REJECTED',
          rejectionReason: reason,
        },
      }),
      prisma.vehicle.update({
        where: { id: sale.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      }),
    ]);

    await NotificationService.createNotification(
      sale.submittedById,
      'REJECTION',
      'Sale Rejected',
      `Vehicle sale ${sale.saleNumber} has been rejected`
    );

    return await this.getSaleById(saleId);
  }

  static async completeSale(saleId: string) {
    const sale = await prisma.vehicleSale.findUnique({
      where: { id: saleId },
      include: { vehicle: true },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status !== SaleStatus.APPROVED) {
      throw new AppError('Only approved sales can be completed', 400);
    }

    await prisma.$transaction([
      prisma.vehicleSale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.COMPLETED,
          completedAt: new Date(),
        },
      }),
      prisma.vehicle.update({
        where: { id: sale.vehicleId },
        data: { status: VehicleStatus.SOLD },
      }),
      prisma.item.update({
        where: { id: sale.vehicle.itemId },
        data: {
          status: 'SOLD',
          quantity: 0,
        },
      }),
    ]);

    await NotificationService.createNotification(
      sale.submittedById,
      'VEHICLE_SALE',
      'Sale Completed',
      `Vehicle sale ${sale.saleNumber} has been completed`
    );

    return await this.getSaleById(saleId);
  }
}
