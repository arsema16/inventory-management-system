import type { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class VehicleController {
  static getAllVehicles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, search } = req.query;

    const vehicles = await VehicleService.getAllVehicles({
      status: status as any,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      data: vehicles,
    });
  });

  static getVehicleById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await VehicleService.getVehicleById(req.params.id);

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  });

  static createVehicle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await VehicleService.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle,
    });
  });

  static updateVehicle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await VehicleService.updateVehicle(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  });

  static deleteVehicle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await VehicleService.deleteVehicle(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
