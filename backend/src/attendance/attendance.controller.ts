import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import {
    diskStorage,
} from 'multer';
import type { Request } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

const storage = diskStorage({
    destination: './uploads/attendance',
    filename: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
    ) => {
        const filename = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
        callback(null, filename);
    },
});

const uploadOptions = {
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
            new Error('Only JPG, PNG, and WebP images are allowed'),
            false,
            );
        }

        callback(null, true);
    },
};

@Controller('attendance')
export class AttendanceController {
    constructor(private attendanceService: AttendanceService) {}
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYEE')
    @Post()
    @UseInterceptors(FileInterceptor('photo', uploadOptions))
    async create(
        @Req() req: any,
        @Body() dto: CreateAttendanceDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Attendance photo is required');
        }

        return this.attendanceService.create(
            req.user.sub,
            dto,
            `attendance/${file.filename}`,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HRD')
    @Get()
    async findAll() {
        return this.attendanceService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYEE')
    @Get('my')
    async findMyAttendance(@Req() req: any) {
        return this.attendanceService.findMyAttendance(req.user.sub);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HRD')
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.findOne(id);
    }
}