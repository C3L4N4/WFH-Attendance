import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) {}
    async create(userId: number, dto: CreateAttendanceDto, photoPath: string) {
    const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
            employee: true,
            },
        });

        if (!user || !user.employee) {
            throw new NotFoundException('Employee account not found');
        }

        if (!user.employee.isActive) {
            throw new ForbiddenException('Inactive employee account');
        }

    const jakartaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

    const attendanceDate = new Date(`${jakartaDate}T00:00:00.000Z`);
    
    try {
        return await this.prisma.attendance.create({
            data: {
            employeeId: user.employee.id,
            attendanceDate,
            photoPath,
            notes: dto.notes,
            },
        });
        } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new ConflictException(
            'Attendance has already been submitted today',
            );
        }

        throw error;
        }
    }

    async findAll() {
        return this.prisma.attendance.findMany({
            include: {
            employee: {
                select: {
                employeeNumber: true,
                fullName: true,
                department: true,
                position: true,
                },
            },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }

    async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
        where: { id },
            include: {
                employee: {
                    select: {
                    employeeNumber: true,
                    fullName: true,
                    department: true,
                    position: true,
                    },
                },
            },
        });

        if (!attendance) {
            throw new NotFoundException('Attendance record not found');
        }

        return attendance;
    }

    async findMyAttendance(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                employeeId: true,
            },
        });

        if (!user || !user.employeeId) {
            throw new NotFoundException('Employee account not found');
        }

        return this.prisma.attendance.findMany({
            where: {
                employeeId: user.employeeId,
            },
            orderBy: {
                attendanceDate: 'desc',
            },
        });
    }
}
