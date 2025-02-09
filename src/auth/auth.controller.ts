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
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'User registered successfully. Please check your email for verification.' };
  }
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return await this.authService.login(loginDto.email, loginDto.password);
  }
  
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() passwordDto: PasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(passwordDto.email);
    return { message: 'If the email exists, a password reset link has been sent.' };
  }
  
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Headers('authorization') authHeader?: string): Promise<{ message: string }> {
    if (!authHeader) {
      throw new BadRequestException('Authorization header is required.');
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Bearer token is missing.');
    }
  
    await this.authService.verifyAccount(token);
    return { message: 'Account verified successfully. You can now log in.' };
  }
    
}