import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    role: 'EMPLOYEE' | 'HRD';
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (
        typeof payload.sub !== 'number' ||
        typeof payload.email !== 'string'
      ) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          employee: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User account not found');
      }

      if (user.role === 'EMPLOYEE' && !user.employee?.isActive) {
        throw new UnauthorizedException('Employee account is inactive');
      }

      request.user = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}