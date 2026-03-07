import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookLog, WebhookLogSchema } from './schemas/webhook-log.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: WebhookLog.name, schema: WebhookLogSchema }]),
        AuthModule,
    ],
    controllers: [WebhookController],
    providers: [WebhookService],
})
export class WebhookModule {}
