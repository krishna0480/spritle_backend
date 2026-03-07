import { Module } from '@nestjs/common';
import { FreshdeskController } from './freshdesk.controller';
import { FreshdeskService } from './freshdesk.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // ✅ Required — FreshdeskService injects UserModel
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // ✅ Required — JwtAuthGuard comes from AuthModule
    AuthModule,
  ],
  controllers: [FreshdeskController],
  providers: [FreshdeskService],
})
export class FreshdeskModule {}