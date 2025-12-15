import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private async handleOAuthCallback(req: Request, res: Response, provider: string) {
    try {
      const user = req.user as any;
      if (!user) {
        throw new Error(`OAuth user not found for ${provider}`);
      }

      const result = await this.authService.oauthLogin(user);
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

      // Set a httpOnly cookie for backend calls
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      res.setHeader(
        'Set-Cookie',
        `token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      );

      return res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
    } catch (error) {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      const message =
        error instanceof Error ? encodeURIComponent(error.message) : 'oauth_error';
      return res.redirect(`${frontendUrl}/auth/callback?error=${message}`);
    }
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('Google OAuth flow initiated');
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {
    console.log('Apple OAuth flow initiated');
    return;
  }

  @Public()
  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'apple');
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    console.log('Microsoft OAuth flow initiated');
    return;
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'microsoft');
  }

  @Public()
  @Get('slack')
  @UseGuards(AuthGuard('slack'))
  async slackAuth() {
    console.log('Slack OAuth flow initiated');
    return;
  }

  @Public()
  @Get('slack/callback')
  @UseGuards(AuthGuard('slack'))
  async slackAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'slack');
  }
}
