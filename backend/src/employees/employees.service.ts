import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany();
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
  
  async create(dto: CreateEmployeeDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const employeeNumber = `EMP-${randomUUID()}`;

    try {
        return await this.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.create({
                data: {
                    employeeNumber,
                    fullName: dto.fullName,
                    department: dto.department,
                    position: dto.position,
                },
            });

            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    employeeId: employee.id,
                },
            });

            return {
                employee,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                };
            });
        }
    catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new ConflictException('Email already exists');
        }

        throw error;
        }
    }

    async update(id: number, dto: UpdateEmployeeDto) {
        await this.findOne(id);

        return this.prisma.employee.update({
            where: { id },
            data: dto,
        });
    }

    async deactivate(id: number) {
        await this.findOne(id);

        return this.prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async activate(id: number) {
        await this.findOne(id);

        return this.prisma.employee.update({
            where: { id },
            data: { isActive: true },
        });
    }
}