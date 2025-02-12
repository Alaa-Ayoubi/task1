import {
  Body,
  Controller,
  Post,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto/login.dto';
import { RegisterDto } from './dto/register.dto/register.dto';
import { PasswordDto } from './dto/password.dto/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<{ message: string }> {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'User registered successfully. Please check your email for verification.' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Headers('authorization') authHeader?: string): Promise<{ message: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing authorization header.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Bearer token is missing.');
    }

    await this.authService.verifyAccount(token);
    return { message: 'Account verified successfully. You can now log in.' };
  }

}
