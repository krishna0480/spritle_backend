import { Body, Controller, Get, Headers, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('webhook')
export class WebhookController {

    constructor(private readonly webhookService: WebhookService) {}

    // ✅ Receives ALL types of webhook events from Freshdesk
    @Post('/freshdesk')
    @HttpCode(200)
    async receiveWebhook(
        @Body() payload: Record<string, any>,
        @Headers() headers: Record<string, string>,
    ) {
        console.log('[Webhook] Headers:', JSON.stringify(headers, null, 2));
        console.log('[Webhook] Payload:', JSON.stringify(payload, null, 2));
        await this.webhookService.receiveWebhook(payload);
        return { received: true };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/logs')
    getLogs(@Query('limit') limit?: string) {
        return this.webhookService.getLogs(limit ? parseInt(limit) : 100);
    }
}
