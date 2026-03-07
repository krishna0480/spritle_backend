import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { Logindto } from './dto/login.dto';
import { loginData, refreshToken, success } from './auth.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface token {
  token: string;
  revoked: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ data: success }> {
    try {
      const { name, email, password } = signUpDto;

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userModel.create({ name, email, password: hashedPassword });

      const data: success = { status: 'Success', isSuccess: true };
      return { data };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: Logindto): Promise<{ data: loginData }> {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });
      if (!user) {
        // ✅ Fix: same message for both cases — don't leak which field is wrong
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = this.jwtService.sign({ id: user._id });
      const ref_token = this.jwtService.sign({ id: user._id }, { expiresIn: '7d' });

      const data: loginData = {
        status: 'Success',
        isSuccess: true,
        token,
        ref_token,
      };

      return { data };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(id: string): Promise<{ data: refreshToken }> {
    // ✅ Fix: guard against undefined id
    if (!id) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const ref_token = this.jwtService.sign({ id: user._id }, { expiresIn: '7d' });

    const data: refreshToken = {
      status: 'Success',
      isSuccess: true,
      ref_token,
    };

    return { data };
  }

  async logout(token: string): Promise<string> {
    await this.storeToken(token);
    return 'Logged out successfully';
  }

  private async storeToken(token: string): Promise<void> {
    const existingToken = await this.cacheManager.get(`${token}`);
    if (!existingToken) {
      const tokenEntity: token = { token, revoked: true };
      await this.cacheManager.set(`${token}`, tokenEntity, 36000000);
    }
  }
}