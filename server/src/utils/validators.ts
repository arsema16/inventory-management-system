import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (fields: Record<string, any>, requiredFields: string[]) => {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }
};

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequired(req.body, requiredFields);
      next();
    } catch (error) {
      next(error);
    }
  };
};
