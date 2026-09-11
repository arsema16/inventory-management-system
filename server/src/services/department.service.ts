import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export class DepartmentService {
  static async getAllDepartments() {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  static async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  static async createDepartment(name: string) {
    const existing = await prisma.department.findUnique({
      where: { name },
    });

    if (existing) {
      throw new AppError('Department with this name already exists', 400);
    }

    const department = await prisma.department.create({
      data: { name },
    });

    return department;
  }

  static async updateDepartment(id: string, name: string) {
    const existing = await prisma.department.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Department not found', 404);
    }

    const nameExists = await prisma.department.findUnique({
      where: { name },
    });

    if (nameExists && nameExists.id !== id) {
      throw new AppError('Department name already in use', 400);
    }

    const department = await prisma.department.update({
      where: { id },
      data: { name },
    });

    return department;
  }

  static async deleteDepartment(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (department._count.users > 0) {
      throw new AppError('Cannot delete department with active users', 400);
    }

    await prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }
}
