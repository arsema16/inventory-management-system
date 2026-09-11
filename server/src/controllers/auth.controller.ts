import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  static getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.getProfile(req.user!.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}
