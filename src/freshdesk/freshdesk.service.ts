import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { ConnectFreshdeskDto } from './dto/connect-freshdesk.dto';

@Injectable()
export class FreshdeskService {

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
    ) {}

    // ── Helper: build base URL + auth header ─────────────────────────────
    private buildHeaders(apiKey: string) {
        const encoded = Buffer.from(`${apiKey}:X`).toString('base64');
        return { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' };
    }

    private buildBaseUrl(domain: string) {
        // Accept "yourcompany" or "yourcompany.freshdesk.com"
        const host = domain.includes('.freshdesk.com') ? domain : `${domain}.freshdesk.com`;
        return `https://${host}/api/v2`;
    }

    // ── Connect Freshdesk ─────────────────────────────────────────────────
    async connectFreshdesk(userId: string, dto: ConnectFreshdeskDto) {
        const { apiKey, domain } = dto;

        // Verify credentials by calling the /agents/me endpoint
        const baseUrl = this.buildBaseUrl(domain);
        const res = await fetch(`${baseUrl}/agents/me`, {
            headers: this.buildHeaders(apiKey),
        });

        if (!res.ok) {
            throw new BadRequestException(
                'Invalid Freshdesk credentials. Please check your API key and domain.',
            );
        }

        await this.userModel.findByIdAndUpdate(userId, {
            freshdeskApiKey: apiKey,
            freshdeskDomain: domain,
        });

        return { status: 'Success', isSuccess: true, message: 'Freshdesk connected successfully' };
    }

    // ── Connection Status ─────────────────────────────────────────────────
    async getStatus(userId: string) {
        const user = await this.userModel.findById(userId).select('freshdeskApiKey freshdeskDomain hubspotAccessToken');
        return {
            freshdesk: !!(user?.freshdeskApiKey && user?.freshdeskDomain),
            hubspot: !!user?.hubspotAccessToken,
        };
    }

    // ── List Tickets ──────────────────────────────────────────────────────
    async getTickets(userId: string) {
        const { apiKey, domain } = await this.getCredentials(userId);
        const baseUrl = this.buildBaseUrl(domain);

        const res = await fetch(`${baseUrl}/tickets?include=requester&per_page=50`, {
            headers: this.buildHeaders(apiKey),
        });

        if (!res.ok) throw new BadRequestException('Failed to fetch tickets from Freshdesk');

        const tickets = await res.json();

        // Return only the fields the frontend needs
        return tickets.map((t: any) => ({
            id: t.id,
            subject: t.subject,
            status: this.mapStatus(t.status),
            priority: this.mapPriority(t.priority),
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            requester: {
                id: t.requester_id,
                name: t.requester?.name ?? null,
                email: t.requester?.email ?? null,
            },
        }));
    }

    // ── Single Ticket ─────────────────────────────────────────────────────
    async getTicketById(userId: string, ticketId: string) {
        const { apiKey, domain } = await this.getCredentials(userId);
        const baseUrl = this.buildBaseUrl(domain);

        const res = await fetch(`${baseUrl}/tickets/${ticketId}?include=requester,description`, {
            headers: this.buildHeaders(apiKey),
        });

        if (res.status === 404) throw new NotFoundException('Ticket not found');
        if (!res.ok) throw new BadRequestException('Failed to fetch ticket');

        const t = await res.json();

        return {
            id: t.id,
            subject: t.subject,
            description: t.description_text,
            status: this.mapStatus(t.status),
            priority: this.mapPriority(t.priority),
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            requester: {
                id: t.requester_id,
                name: t.requester?.name ?? null,
                email: t.requester?.email ?? null,
            },
            tags: t.tags ?? [],
        };
    }

    // ── Ticket Conversations ──────────────────────────────────────────────
    async getConversations(userId: string, ticketId: string) {
        const { apiKey, domain } = await this.getCredentials(userId);
        const baseUrl = this.buildBaseUrl(domain);

        const res = await fetch(`${baseUrl}/tickets/${ticketId}/conversations`, {
            headers: this.buildHeaders(apiKey),
        });

        if (!res.ok) throw new BadRequestException('Failed to fetch conversations');

        const conversations = await res.json();

        return conversations.map((c: any) => ({
            id: c.id,
            body: c.body_text,
            incoming: c.incoming,        // true = from customer, false = agent reply
            private: c.private,
            createdAt: c.created_at,
            fromEmail: c.from_email,
            authorId: c.user_id,
        }));
    }

    // ── Internal helpers ──────────────────────────────────────────────────
    private async getCredentials(userId: string) {
        const user = await this.userModel.findById(userId).select('freshdeskApiKey freshdeskDomain');
        if (!user?.freshdeskApiKey || !user?.freshdeskDomain) {
            throw new UnauthorizedException('Freshdesk account not connected. Please connect first.');
        }
        return { apiKey: user.freshdeskApiKey, domain: user.freshdeskDomain };
    }

    private mapStatus(code: number): string {
        const map: Record<number, string> = { 2: 'Open', 3: 'Pending', 4: 'Resolved', 5: 'Closed' };
        return map[code] ?? 'Unknown';
    }

    private mapPriority(code: number): string {
        const map: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
        return map[code] ?? 'Unknown';
    }
}
