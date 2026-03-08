import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from './schemas/webhook-log.schema';

const STATUS_MAP: Record<string, string> = {
  '2': 'Open',
  '3': 'Pending',
  '4': 'Resolved',
  '5': 'Closed',
};

const PRIORITY_MAP: Record<string, string> = {
  '1': 'Low',
  '2': 'Medium',
  '3': 'High',
  '4': 'Urgent',
};

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(WebhookLog.name)
    private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  // ── Receive and save an incoming Freshdesk webhook ────────────────────
  async receiveWebhook(payload: Record<string, any>): Promise<void> {
    const eventType =
      payload?.freshdesk_webhook?.type ??
      payload?.event ??
      payload?.type ??
      payload?.action ??
      payload?.trigger ??
      'unknown';

    const sanitized = {
      ...payload,
      status:
        STATUS_MAP[String(payload.status)] ??
        payload.status_name ??
        (payload.status && payload.status !== '' ? payload.status : 'Open'),

      priority:
        PRIORITY_MAP[String(payload.priority)] ??
        payload.priority_name ??
        (payload.priority && payload.priority !== '' ? payload.priority : 'Low'),

      created_at:
        payload.created_at && String(payload.created_at).trim() !== ''
          ? new Date(payload.created_at).toISOString()
          : new Date().toISOString(),
    };

    await this.webhookLogModel.create({
      eventType,
      payload: sanitized,
    });

    console.log(
      `[Webhook] Received event: ${eventType}`,
      JSON.stringify(sanitized, null, 2),
    );
  }

  // ── Fetch all logs (newest first) ─────────────────────────────────────
  async getLogs(limit = 100) {
    const logs = await this.webhookLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return logs.map((l) => ({
      id:        l._id,
      eventType: l.eventType,
      payload:   l.payload,
      receivedAt: (l as any).createdAt,
    }));
  }
}