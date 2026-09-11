import type { Request, Response, NextFunction } from 'express';
import { VehicleSaleService } from '../services/vehicleSale.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class VehicleSaleController {
  static getAllSales = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, vehicleId } = req.query;

    const sales = await VehicleSaleService.getAllSales({
      status: status as any,
      vehicleId: vehicleId as string,
    });

    res.status(200).json({
      success: true,
      data: sales,
    });
  });

  static getSaleById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sale = await VehicleSaleService.getSaleById(String(req.params["id"]));

    res.status(200).json({
      success: true,
      data: sale,
    });
  });

  static createSale = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sale = await VehicleSaleService.createSale(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale,
    });
  });

  static approveSale = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sale = await VehicleSaleService.approveSale(String(req.params["id"]), req.user!.id, req.body.comments);

    res.status(200).json({
      success: true,
      message: 'Sale approved successfully',
      data: sale,
    });
  });

  static rejectSale = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sale = await VehicleSaleService.rejectSale(String(req.params["id"]), req.user!.id, req.body.reason);

    res.status(200).json({
      success: true,
      message: 'Sale rejected successfully',
      data: sale,
    });
  });

  static completeSale = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sale = await VehicleSaleService.completeSale(String(req.params["id"]));

    res.status(200).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale,
    });
  });
}
