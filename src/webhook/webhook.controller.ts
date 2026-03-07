import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('webhook')
export class WebhookController {

    constructor(private readonly webhookService: WebhookService) {}

    /**
     * POST /webhook/freshdesk
     * 
     * This is a PUBLIC endpoint — Freshdesk calls this from their servers.
     * No JWT guard here. Freshdesk doesn't send your JWT token.
     * 
     * Setup in Freshdesk:
     *   Admin → Automation → Webhooks → Add webhook URL → https://yourapp.com/webhook/freshdesk
     */
    @Post('/freshdesk')
    @HttpCode(200)
    async receiveWebhook(@Body() payload: Record<string, any>) {
        await this.webhookService.receiveWebhook(payload);
        return { received: true };
    }

    /**
     * GET /webhook/logs
     * Protected — only logged-in users can view logs.
     * Optional query: ?limit=50
     */
    @UseGuards(JwtAuthGuard)
    @Get('/logs')
    getLogs(@Query('limit') limit?: string) {
        return this.webhookService.getLogs(limit ? parseInt(limit) : 100);
    }
}
