import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';
import { validateEmail } from '../utils/validators.js';

export class UserService {
  static async getAllUsers(filters?: { role?: UserRole; departmentId?: string; isActive?: boolean }) {
    const where: any = {};

    if (filters?.role) where.role = filters.role;
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    departmentId?: string;
  }) {
    if (!validateEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    if (data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
        departmentId: data.departmentId || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: UserRole;
      departmentId?: string;
      isActive?: boolean;
    }
  ) {
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== existingUser.email) {
      if (!validateEmail(data.email)) {
        throw new AppError('Invalid email format', 400);
      }

      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }
}
