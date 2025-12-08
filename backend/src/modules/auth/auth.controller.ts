import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.oauthLogin(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {
    // Initiates Apple OAuth flow
  }

  @Public()
  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.oauthLogin(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Initiates Microsoft OAuth flow
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.oauthLogin(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  @Public()
  @Get('slack')
  @UseGuards(AuthGuard('slack'))
  async slackAuth() {
    // Initiates Slack OAuth flow
  }

  @Public()
  @Get('slack/callback')
  @UseGuards(AuthGuard('slack'))
  async slackAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.oauthLogin(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }
}

