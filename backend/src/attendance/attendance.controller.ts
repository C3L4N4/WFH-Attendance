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
  Res,
  NotFoundException,
} from '@nestjs/common';

import { unlink } from 'node:fs/promises';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { resolve, relative, isAbsolute } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Query } from '@nestjs/common';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';

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
                new BadRequestException(
                    'Only JPG, PNG, and WebP images are allowed',
                ),
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

        try {
            const { fileTypeFromFile } = await import('file-type');

            const detectedType = await fileTypeFromFile(file.path);

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            if (
                !detectedType ||
                !allowedTypes.includes(detectedType.mime) ||
                detectedType.mime !== file.mimetype
            ) {
                throw new BadRequestException(
                    'Invalid image. Only genuine JPG, PNG, and WebP files are allowed.',
                );
            }

            return await this.attendanceService.create(
                req.user.sub,
                dto,
                `attendance/${file.filename}`,
            );
        } catch (error) {
            await unlink(file.path).catch(() => undefined);

            throw error;
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HRD')
    @Get()
    async findAll(@Query() filters: FilterAttendanceDto) {
        return this.attendanceService.findAll(filters);
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HRD')
    @Get(':id/photo')
    async getPhoto(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
        ) {
            const attendance = await this.attendanceService.findOne(id);

            const uploadDirectory = resolve(process.cwd(), 'uploads');

            const photoPath = resolve(
                uploadDirectory,
                attendance.photoPath,
            );

            const relativePath = relative(uploadDirectory, photoPath);

            if (
                relativePath.startsWith('..') ||
                isAbsolute(relativePath)
            ) {
                throw new NotFoundException('Attendance photo not found');
            }

            if (!existsSync(photoPath)) {
                throw new NotFoundException('Attendance photo not found');
            }

        return res.sendFile(photoPath);
    }
}