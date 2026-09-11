import { DocumentType } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';
import { deleteFile } from '../middleware/upload.js';
import path from 'path';

export class DocumentService {
  static async uploadDocument(
    saleId: string,
    userId: string,
    file: Express.Multer.File,
    type: DocumentType
  ) {
    // Verify sale exists
    const sale = await prisma.vehicleSale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      // Delete uploaded file if sale doesn't exist
      deleteFile(file.path);
      throw new AppError('Sale not found', 404);
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        saleId,
        type,
        fileName: file.originalname,
        fileUrl: file.path,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return document;
  }

  static async getDocumentsBySale(saleId: string) {
    const documents = await prisma.document.findMany({
      where: { saleId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  static async getDocumentById(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        sale: {
          select: {
            id: true,
            saleNumber: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    return document;
  }

  static async deleteDocument(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Delete file from filesystem
    try {
      deleteFile(document.fileUrl);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // Delete database record
    await prisma.document.delete({
      where: { id },
    });

    return { message: 'Document deleted successfully' };
  }
}
