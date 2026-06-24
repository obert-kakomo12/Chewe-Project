import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Post('register')
  register(@Body() signUpDto: Record<string, any>) {
    return this.authService.register(signUpDto.email, signUpDto.password, signUpDto.name, signUpDto.accessCode);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: Record<string, any>, @Headers('origin') origin?: string) {
    return this.authService.forgotPassword(dto.email, origin);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: Record<string, any>) {
    return this.authService.resetPassword(dto.email, dto.token, dto.newPassword);
  }
}
