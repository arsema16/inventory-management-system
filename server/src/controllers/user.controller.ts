import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class UserController {
  static getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { role, departmentId, isActive } = req.query;

    const users = await UserService.getAllUsers({
      role: role as any,
      departmentId: departmentId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  static createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const result = await UserService.changePassword(req.user!.id, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
