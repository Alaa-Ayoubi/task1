import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { access } from 'fs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  mailService: any;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(email: string, password: string): Promise<any> {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          isVerified: false,
        },
      });

      const verificationToken = this.generateToken({ email: user.email }, '24h');
      console.log(`Verification token for user ${email}: ${verificationToken}`);

      return {
        message: 'User created. Please verify your email.',
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your account first.');
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  
    const payload = { userId: user.id, isVerified: user.isVerified };
    const accessToken = this.jwtService.sign(payload);
  
    return { accessToken };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + Number(process.env.RESET_PASSWORD_EXPIRATION));

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpires: tokenExpiration },
    });

    await this.mailService.sendResetPasswordEmail(email, resetToken);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gte: new Date() } },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Password reset successful' };
  }

  async verifyAccount(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
  
      console.log('Decoded token:', decoded);
  
      if (!decoded.email) {
        throw new BadRequestException('Invalid token: email is missing');
      }
  
      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email }, 
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      if (user.isVerified) {
        console.log(`User ${user.email} is already verified.`);
        return;
      }
  
      await this.prisma.user.update({
        where: { email: user.email },
        data: { isVerified: true },
      });
  
      console.log(`User ${user.email} has been verified successfully.`);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token has expired. Please request a new one.');
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
      
  private generateToken(payload: any, expiresIn = '1h'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }
}

