import type { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { AppError } from '../utils/errorHandler.js';
import path from 'path';
import fs from 'fs';

export class DocumentController {
  static uploadDocument = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const saleId = String(req.params['saleId']);
    const { type } = req.body;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!type) {
      throw new AppError('Document type is required', 400);
    }

    const document = await DocumentService.uploadDocument(saleId, req.user!.id, req.file, type);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  });

  static getDocumentsBySale = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const saleId = String(req.params['saleId']);

      const documents = await DocumentService.getDocumentsBySale(saleId);

      res.status(200).json({
        success: true,
        data: documents,
      });
    }
  );

  static downloadDocument = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = String(req.params['id']);

      const document = await DocumentService.getDocumentById(id);

      const filePath = path.join(process.cwd(), document.fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found on server', 404);
      }

      res.download(filePath, document.fileName);
    }
  );

  static deleteDocument = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = String(req.params['id']);

    const result = await DocumentService.deleteDocument(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
