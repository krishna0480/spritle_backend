import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HubspotController } from './hubspot.controller';
import { HubspotService } from './hubspot.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthModule,
    ],
    controllers: [HubspotController],
    providers: [HubspotService],
    exports: [HubspotService],
})
export class HubspotModule {}
