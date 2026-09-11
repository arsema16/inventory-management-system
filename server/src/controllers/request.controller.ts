import type { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/request.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

export class RequestController {
  static getAllRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, type, requestedById } = req.query;

    const requests = await RequestService.getAllRequests({
      status: status as any,
      type: type as any,
      requestedById: requestedById as string,
    });

    res.status(200).json({
      success: true,
      data: requests,
    });
  });

  static getRequestById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const request = await RequestService.getRequestById(req.params.id);

    res.status(200).json({
      success: true,
      data: request,
    });
  });

  static createRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const request = await RequestService.createRequest(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request,
    });
  });

  static approveRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const request = await RequestService.approveRequest(req.params.id, req.user!.id, req.body.comments);

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: request,
    });
  });

  static rejectRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const request = await RequestService.rejectRequest(req.params.id, req.user!.id, req.body.reason);

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      data: request,
    });
  });

  static fulfillRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const request = await RequestService.fulfillRequest(req.params.id, req.user!.id);

    res.status(200).json({
      success: true,
      message: 'Request fulfilled successfully',
      data: request,
    });
  });
}
