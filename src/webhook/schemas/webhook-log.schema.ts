import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    userId: Types.ObjectId;

    // e.g. "ticket_created", "ticket_updated"
    @Prop({ required: true })
    eventType: string;

    // Full raw payload from Freshdesk
    @Prop({ type: Object, required: true })
    payload: Record<string, any>;

    // Auto-set by Mongoose via timestamps:true → createdAt, updatedAt
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);
