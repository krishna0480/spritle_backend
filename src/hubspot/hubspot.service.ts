import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class HubspotService {

    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private configService: ConfigService,
    ) {
        this.clientId     = this.configService.get<string>('HUBSPOT_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('HUBSPOT_CLIENT_SECRET');
        this.redirectUri  = this.configService.get<string>('HUBSPOT_REDIRECT_URI');
    }

    // ── Step 1: Build the OAuth authorization URL ─────────────────────────
    getAuthUrl(): string {
        const scopes = [
            'crm.objects.contacts.read',
            'crm.objects.contacts.write',
            'oauth',
        ].join(' ');

        const params = new URLSearchParams({
            client_id:     this.clientId,
            redirect_uri:  this.redirectUri,
            scope:         scopes,
            response_type: 'code',
        });

        // ✅ Fixed: app-na2 matches your HubSpot account region
        return `https://app-na2.hubspot.com/oauth/authorize?${params.toString()}`;
    }

    // ── Step 2: Exchange the code for tokens (callback) ───────────────────
    async handleCallback(userId: string, code: string) {
        const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:    'authorization_code',
                client_id:     this.clientId,
                client_secret: this.clientSecret,
                redirect_uri:  this.redirectUri,
                code,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new BadRequestException(
                err.message ?? 'Failed to exchange HubSpot auth code',
            );
        }

        const { access_token, refresh_token, expires_in } = await res.json();
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        await this.userModel.findByIdAndUpdate(userId, {
            hubspotAccessToken:    access_token,
            hubspotRefreshToken:   refresh_token,
            hubspotTokenExpiresAt: expiresAt,
        });

        return {
            status: 'Success',
            isSuccess: true,
            message: 'HubSpot connected successfully',
        };
    }

    // ── Search contact by email ───────────────────────────────────────────
    async getContactByEmail(userId: string, email: string) {
        const accessToken = await this.getValidToken(userId);

        const res = await fetch(
            'https://api.hubapi.com/crm/v3/objects/contacts/search',
            {
                method: 'POST',
                headers: {
                    Authorization:  `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filterGroups: [{
                        filters: [{
                            propertyName: 'email',
                            operator:     'EQ',
                            value:        email,
                        }],
                    }],
                    properties: [
                        'firstname',
                        'lastname',
                        'email',
                        'phone',
                        'company',
                        'lifecyclestage',
                    ],
                    limit: 1,
                }),
            },
        );

        if (!res.ok) {
            throw new BadRequestException('Failed to search HubSpot contacts');
        }

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            return { found: false, contact: null };
        }

        const props = data.results[0].properties;
        return {
            found: true,
            contact: {
                id:             data.results[0].id,
                name:           `${props.firstname ?? ''} ${props.lastname ?? ''}`.trim(),
                email:          props.email,
                phone:          props.phone          ?? null,
                company:        props.company        ?? null,
                lifecycleStage: props.lifecyclestage ?? null,
            },
        };
    }

    // ── Auto-refresh the access token if expired ──────────────────────────
    private async getValidToken(userId: string): Promise<string> {
        const user = await this.userModel
            .findById(userId)
            .select('hubspotAccessToken hubspotRefreshToken hubspotTokenExpiresAt');

        if (!user?.hubspotAccessToken) {
            throw new UnauthorizedException(
                'HubSpot account not connected. Please connect first.',
            );
        }

        const fiveMinutes = 5 * 60 * 1000;
        const isExpired =
            !user.hubspotTokenExpiresAt ||
            new Date(user.hubspotTokenExpiresAt).getTime() - Date.now() < fiveMinutes;

        if (!isExpired) return user.hubspotAccessToken;

        // ── Refresh expired token ─────────────────────────────────────────
        const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:    'refresh_token',
                client_id:     this.clientId,
                client_secret: this.clientSecret,
                refresh_token: user.hubspotRefreshToken,
            }),
        });

        if (!res.ok) {
            throw new UnauthorizedException(
                'HubSpot token refresh failed. Please reconnect.',
            );
        }

        const { access_token, refresh_token, expires_in } = await res.json();
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        await this.userModel.findByIdAndUpdate(userId, {
            hubspotAccessToken:    access_token,
            hubspotRefreshToken:   refresh_token,
            hubspotTokenExpiresAt: expiresAt,
        });

        return access_token;
    }
}