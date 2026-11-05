import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === 'EMPLOYEE' && !user.employee?.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee
          ? {
              id: user.employee.id,
              employeeNumber: user.employee.employeeNumber,
              fullName: user.employee.fullName,
              department: user.employee.department,
            }
          : null,
      },
    };
  }
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeNumber: user.employee.employeeNumber,
            fullName: user.employee.fullName,
            department: user.employee.department,
          }
        : null,
    };
  }
}