import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from './schemas/webhook-log.schema';

@Injectable()
export class WebhookService {

    constructor(
        @InjectModel(WebhookLog.name)
        private webhookLogModel: Model<WebhookLogDocument>,
    ) {}

    // ── Receive and save an incoming Freshdesk webhook ────────────────────
    async receiveWebhook(payload: Record<string, any>): Promise<void> {
        // Freshdesk sends event info in the payload root.
        // Common fields: freshdesk_webhook, ticket_id, etc.
        // We try to read event type from the payload; fall back to "unknown"
        const eventType =
            payload?.freshdesk_webhook?.type ??
            payload?.event ??
            payload?.type ??
            'unknown';

        await this.webhookLogModel.create({
            eventType,
            payload,
        });

        console.log(`[Webhook] Received event: ${eventType}`);
    }

    // ── Fetch all logs (newest first) ─────────────────────────────────────
    async getLogs(limit = 100) {
        const logs = await this.webhookLogModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return logs.map((l) => ({
            id: l._id,
            eventType: l.eventType,
            payload: l.payload,
            receivedAt: (l as any).createdAt,
        }));
    }
}
