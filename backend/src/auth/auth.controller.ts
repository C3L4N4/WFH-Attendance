import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    role: 'EMPLOYEE' | 'HRD';
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('hrd-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HRD')
  getHrdTest() {
    return {
      message: 'Welcome, HRD administrator!',
    };
  }
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user.sub);
  }
}