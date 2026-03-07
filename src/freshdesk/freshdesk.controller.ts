import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FreshdeskService } from './freshdesk.service';
import { ConnectFreshdeskDto } from './dto/connect-freshdesk.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('freshdesk')
export class FreshdeskController {

    constructor(private readonly freshdeskService: FreshdeskService) {}

    // POST /freshdesk/connect
    @Post('/connect')
    connectFreshdesk(@Req() req, @Body() dto: ConnectFreshdeskDto) {
        return this.freshdeskService.connectFreshdesk(req.user._id, dto);
    }

    // GET /freshdesk/status
    @Get('/status')
    getStatus(@Req() req) {
        return this.freshdeskService.getStatus(req.user._id);
    }

    // GET /freshdesk/tickets
    @Get('/tickets')
    getTickets(@Req() req) {
        console.log('USER FROM JWT:', req.user); 
        return this.freshdeskService.getTickets(req.user._id);
    }

    // GET /freshdesk/tickets/:id
    @Get('/tickets/:id')
    getTicketById(@Req() req, @Param('id') id: string) {
        return this.freshdeskService.getTicketById(req.user._id, id);
    }

    // GET /freshdesk/tickets/:id/conversations
    @Get('/tickets/:id/conversations')
    getConversations(@Req() req, @Param('id') id: string) {
        return this.freshdeskService.getConversations(req.user._id, id);
    }
}
