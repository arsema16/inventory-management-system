import { ItemType, ItemStatus } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export class ItemService {
  static async getAllItems(filters?: {
    type?: ItemType;
    status?: ItemStatus;
    lowStock?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.lowStock) {
      where.quantity = { lte: prisma.item.fields.minimumQty };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  static async getItemById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        vehicle: true,
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    return item;
  }

  static async createItem(data: {
    name: string;
    sku: string;
    description?: string;
    type?: ItemType;
    unit?: string;
    quantity?: number;
    minimumQty?: number;
    location?: string;
  }) {
    const existing = await prisma.item.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new AppError('Item with this SKU already exists', 400);
    }

    const item = await prisma.item.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        type: data.type || ItemType.GENERAL,
        unit: data.unit || 'piece',
        quantity: data.quantity || 0,
        minimumQty: data.minimumQty || 0,
        location: data.location,
        status: ItemStatus.AVAILABLE,
      },
    });

    return item;
  }

  static async updateItem(
    id: string,
    data: {
      name?: string;
      sku?: string;
      description?: string;
      unit?: string;
      minimumQty?: number;
      location?: string;
      status?: ItemStatus;
    }
  ) {
    const existing = await prisma.item.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Item not found', 404);
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.item.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new AppError('SKU already in use', 400);
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.sku && { sku: data.sku }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.unit && { unit: data.unit }),
        ...(data.minimumQty !== undefined && { minimumQty: data.minimumQty }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.status && { status: data.status }),
      },
    });

    return item;
  }

  static async deleteItem(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (item.vehicle) {
      throw new AppError('Cannot delete item linked to a vehicle', 400);
    }

    // Check if item has any pending requests
    const pendingRequests = await prisma.requestItem.count({
      where: {
        itemId: id,
        request: {
          status: { in: ['PENDING', 'APPROVED', 'PARTIALLY_APPROVED'] },
        },
      },
    });

    if (pendingRequests > 0) {
      throw new AppError('Cannot delete item with pending requests', 400);
    }

    await prisma.item.delete({ where: { id } });

    return { message: 'Item deleted successfully' };
  }

  static async getLowStockItems() {
    const items = await prisma.$queryRaw<any[]>`
      SELECT * FROM items 
      WHERE quantity <= "minimumQty" 
      AND status != 'INACTIVE'
      ORDER BY quantity ASC
    `;

    return items;
  }

  static async restockItem(id: string, quantity: number, userId: string) {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
    }

    const previousQty = item.quantity;
    const newQty = previousQty + quantity;

    // Update item and create stock movement in a transaction
    const [updatedItem] = await prisma.$transaction([
      prisma.item.update({
        where: { id },
        data: {
          quantity: newQty,
          status: ItemStatus.AVAILABLE,
        },
      }),
      prisma.stockMovement.create({
        data: {
          itemId: id,
          userId,
          type: 'IN',
          quantity,
          previousQty,
          newQty,
          notes: 'Restock',
        },
      }),
    ]);

    return updatedItem;
  }

  static async getStockMovements(itemId: string) {
    const movements = await prisma.stockMovement.findMany({
      where: { itemId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return movements;
  }
}
