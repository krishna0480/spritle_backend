import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { HubspotService } from './hubspot.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('hubspot')
export class HubspotController {

    constructor(private readonly hubspotService: HubspotService) {}

    // GET /hubspot/connect  → returns the HubSpot OAuth URL for the frontend to redirect to
    @Get('/connect')
    getAuthUrl() {
        const url = this.hubspotService.getAuthUrl();
        return { url };
    }

    // GET /hubspot/callback?code=xxx  → HubSpot redirects here after user approves
    @Get('/callback')
    handleCallback(@Req() req, @Query('code') code: string) {
        return this.hubspotService.handleCallback(req.user._id, code);
    }

    // GET /hubspot/contact?email=john@example.com
    @Get('/contact')
    getContact(@Req() req, @Query('email') email: string) {
        return this.hubspotService.getContactByEmail(req.user._id, email);
    }
}
