import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class User {

  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  // ✅ Freshdesk fields
  @Prop({ default: null })
  freshdeskApiKey: string | null;

  @Prop({ default: null })
  freshdeskDomain: string | null;

  // ✅ HubSpot OAuth fields
  @Prop({ default: null })
  hubspotAccessToken: string | null;

  @Prop({ default: null })
  hubspotRefreshToken: string | null;

  @Prop({ default: null })
  hubspotTokenExpiresAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);