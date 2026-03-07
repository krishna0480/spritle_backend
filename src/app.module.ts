import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FreshdeskModule } from './freshdesk/freshdesk.module';
import { HubspotModule } from './hubspot/hubspot.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.DB_URI),
        AuthModule,
        FreshdeskModule,
        HubspotModule,
        WebhookModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
