import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  UnauthorizedException,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private postsService: PostsService) {}

  // 📝 إنشاء منشور جديد
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @GetUser('userId') userId: number, 
    @Body() body: { title: string; content: string },
  ) {
    this.logger.log(`Creating post for userId: ${userId}`);
    
    if (!body.title || !body.content) {
      throw new BadRequestException('Title and content cannot be empty');
    }

    return this.postsService.createPost(userId, body.title, body.content);
  }

  // ✏️ تحديث منشور موجود
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: { title: string; content: string },
    @GetUser('userId') userId: number,
  ) {
    this.logger.log(`Updating postId: ${postId} for userId: ${userId}`);

    if (!body.title || !body.content) {
      throw new BadRequestException('Title and content cannot be empty');
    }

    return this.postsService.updatePost(postId, body.title, body.content, userId);
  }

  // 🗑️ حذف منشور
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePost(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    this.logger.log(`Deleting postId: ${postId} for userId: ${userId}`);

    return this.postsService.deletePost(userId, postId);
  }
}
