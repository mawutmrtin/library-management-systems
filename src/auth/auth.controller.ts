import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register') register(@Body() dto: Parameters<AuthService['register']>[0]) { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: Parameters<AuthService['login']>[0]) { return this.auth.login(dto); }
}