import type { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class DepartmentController {
  static getAllDepartments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const departments = await DepartmentService.getAllDepartments();

    res.status(200).json({
      success: true,
      data: departments,
    });
  });

  static getDepartmentById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.getDepartmentById(String(req.params["id"]));

    res.status(200).json({
      success: true,
      data: department,
    });
  });

  static createDepartment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.createDepartment(req.body.name);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  });

  static updateDepartment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.updateDepartment(String(req.params["id"]), req.body.name);

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  });

  static deleteDepartment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DepartmentService.deleteDepartment(String(req.params["id"]));

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
