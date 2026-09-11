import type { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class ItemController {
  static getAllItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { type, status, lowStock, search } = req.query;

    const items = await ItemService.getAllItems({
      type: type as any,
      status: status as any,
      lowStock: lowStock === 'true',
      search: search as string,
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  });

  static getItemById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const item = await ItemService.getItemById(req.params.id);

    res.status(200).json({
      success: true,
      data: item,
    });
  });

  static createItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const item = await ItemService.createItem(req.body);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  });

  static updateItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const item = await ItemService.updateItem(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  });

  static deleteItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ItemService.deleteItem(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  static getLowStockItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const items = await ItemService.getLowStockItems();

    res.status(200).json({
      success: true,
      data: items,
    });
  });

  static restockItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { quantity } = req.body;
    const userId = (req as any).user.id;
    const item = await ItemService.restockItem(req.params.id, quantity, userId);

    res.status(200).json({
      success: true,
      message: 'Item restocked successfully',
      data: item,
    });
  });

  static getStockMovements = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const movements = await ItemService.getStockMovements(req.params.id);

    res.status(200).json({
      success: true,
      data: movements,
    });
  });
}
