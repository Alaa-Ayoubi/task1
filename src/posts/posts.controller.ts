import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  UnauthorizedException,
  Post,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { VerifiedGuard } from '../auth/guards/jwt-auth/Verified.Guard';
import { GetUser } from '../auth/decorators/get-user.decorator/get-user.decorator';
import { User, Post as PrismaPost } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  constructor(private postsService: PostsService, private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Req() req, @Body() body) {
    console.log('User from token:', req.user); // تحقق من بيانات المستخدم
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.postsService.createPost(req.user.userId, body.title, body.content);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: { title: string; content: string },
    @GetUser('userId') userId: number, ) {
    console.log(`🔥 Calling updatePost with postId: ${postId}, userId: ${userId}, title: ${body.title}, content: ${body.content}`);
    console.log('🟢 User in Controller:', userId); // 🔥 إضافة تسجيل للتأكد من استقباله
    console.log('🟢 Post ID:', postId);
 
  

    if (!userId) {
      throw new UnauthorizedException('User ID missing in extracted user');
    }
  
    return this.postsService.updatePost(postId, body.title, body.content, userId);
  }
          
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePost(
    @GetUser('userId') userId: number,  // ✅ استخراج userId فقط
    @Param('id', ParseIntPipe) postId: number,
  ) {
    console.log(`🔥 Deleting post with postId: ${postId}, userId: ${userId}`);
  
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
  
    return this.postsService.deletePost(userId, postId);
  }
  }
