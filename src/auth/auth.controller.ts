import { Body, Controller, Post, Get, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Logindto } from './dto/login.dto';
import { Request } from 'express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RefreshJwtGuard } from './guards/refresh-auth.guards';
import { JwtAuthGuard } from './guards/auth.guards';

export type success = {
  status: string;
  isSuccess: boolean;
};

export interface loginData {
  status: string;
  isSuccess: boolean;
  token: string;
  ref_token: string;
}

export interface refreshToken {
  status: string;
  isSuccess: boolean;
  ref_token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ data: success }> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/login')
  login(@Body() loginDto: Logindto): Promise<{ data: loginData }> {
    return this.authService.login(loginDto);
  }

  // ✅ Fix: renamed from "async" (reserved keyword) to "refreshToken"
  // ✅ Fix: req.user.payload.id — correct path from RefreshJwtStrategy.validate()
  @UseGuards(RefreshJwtGuard)
  @Post('/refresh')
  refreshToken(@Req() req): Promise<{ data: refreshToken }> {
    return this.authService.refreshToken(req.user?.payload?.id);
  }

  // ✅ Fix: protected with JwtAuthGuard + null guard on auth header
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('/logout')
  async logout(@Req() req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) return 'No token provided';
    const token = authHeader.replace('Bearer ', '').trim();
    return this.authService.logout(token);
  }
}