import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from 'src/app.controller';
import { JwtAuthGuard } from './guards/auth.guards';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtGuard } from './guards/refresh-auth.guards';
import { RefreshJwtStrategy } from './refreshToken.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        CacheModule.register({
            ttl: 3600, 
            max: 10,
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_SECRET'), // krishna@123
                    signOptions: {
                        expiresIn: config.get<string>('JWT_EXPIRE') ?? '1d',
                    },
                };
            },
        }),
        MongooseModule.forFeature([{ name:'User', schema:UserSchema}])
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard ,RefreshJwtStrategy,JwtStrategy,RefreshJwtGuard],
    exports:[PassportModule,JwtAuthGuard,JwtStrategy,CacheModule,RefreshJwtGuard,RefreshJwtStrategy],
})
    
export class AuthModule {}
