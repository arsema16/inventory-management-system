import { VehicleStatus, ItemType, ItemStatus } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export class VehicleService {
  static async getAllVehicles(filters?: { status?: VehicleStatus; search?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { vehicleId: { contains: filters.search, mode: 'insensitive' } },
        { vin: { contains: filters.search, mode: 'insensitive' } },
        { plateNumber: { contains: filters.search, mode: 'insensitive' } },
        { make: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles;
  }

  static async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        item: true,
        sales: {
          include: {
            client: true,
            submittedBy: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }

  static async createVehicle(data: {
    vehicleId: string;
    vin?: string;
    plateNumber?: string;
    make: string;
    model: string;
    year?: number;
    batteryInfo?: string;
    mileage?: number;
    salePrice?: number;
    itemName?: string;
    sku: string;
  }) {
    // Check for duplicates
    const existing = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { vehicleId: data.vehicleId },
          ...(data.vin ? [{ vin: data.vin }] : []),
          ...(data.plateNumber ? [{ plateNumber: data.plateNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new AppError('Vehicle with this ID, VIN, or plate number already exists', 400);
    }

    // Create item first
    const itemName = data.itemName || `${data.make} ${data.model} ${data.year || ''}`.trim();

    const vehicle = await prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          name: itemName,
          sku: data.sku,
          type: ItemType.VEHICLE,
          status: ItemStatus.AVAILABLE,
          quantity: 1,
        },
      });

      const newVehicle = await tx.vehicle.create({
        data: {
          itemId: item.id,
          vehicleId: data.vehicleId,
          vin: data.vin,
          plateNumber: data.plateNumber,
          make: data.make,
          model: data.model,
          year: data.year,
          batteryInfo: data.batteryInfo,
          mileage: data.mileage,
          salePrice: data.salePrice,
          status: VehicleStatus.AVAILABLE,
        },
        include: {
          item: true,
        },
      });

      return newVehicle;
    });

    return vehicle;
  }

  static async updateVehicle(
    id: string,
    data: {
      vin?: string;
      plateNumber?: string;
      make?: string;
      model?: string;
      year?: number;
      batteryInfo?: string;
      mileage?: number;
      salePrice?: number;
      status?: VehicleStatus;
    }
  ) {
    const existing = await prisma.vehicle.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Vehicle not found', 404);
    }

    // Check for duplicate VIN or plate number
    if (data.vin || data.plateNumber) {
      const duplicate = await prisma.vehicle.findFirst({
        where: {
          id: { not: id },
          OR: [...(data.vin ? [{ vin: data.vin }] : []), ...(data.plateNumber ? [{ plateNumber: data.plateNumber }] : [])],
        },
      });

      if (duplicate) {
        throw new AppError('VIN or plate number already in use', 400);
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.vin !== undefined && { vin: data.vin }),
        ...(data.plateNumber !== undefined && { plateNumber: data.plateNumber }),
        ...(data.make && { make: data.make }),
        ...(data.model && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.batteryInfo !== undefined && { batteryInfo: data.batteryInfo }),
        ...(data.mileage !== undefined && { mileage: data.mileage }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.status && { status: data.status }),
      },
      include: {
        item: true,
      },
    });

    return vehicle;
  }

  static async deleteVehicle(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { sales: true },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.sales.length > 0) {
      throw new AppError('Cannot delete vehicle with sales records', 400);
    }

    // Delete vehicle and associated item
    await prisma.$transaction([
      prisma.vehicle.delete({ where: { id } }),
      prisma.item.delete({ where: { id: vehicle.itemId } }),
    ]);

    return { message: 'Vehicle deleted successfully' };
  }
}
