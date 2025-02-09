import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

  async getAllPostsForUser(userId: number): Promise<Post[]> {
    try {
      this.logger.log(`Fetching posts for userId: ${userId}`);
      return await this.prisma.post.findMany({ where: {  userId: userId as number } });
    } catch (error) {
      this.logger.error('Error fetching posts', error.stack);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async createPost(userId: number, title: string, content: string): Promise<Post> {
    try {
      this.logger.log(`Creating post for userId: ${userId}, title: ${title}, content: ${content}`);
      return await this.prisma.post.create({
        data: {
          userId,
          title,
          content,
        },
      });
    } catch (error) {
      this.logger.error('Error creating post', error.stack);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async updatePost(postId: number, title: string, content: string, userId: number): Promise<Post> {
    try {
      this.logger.log(`Updating postId: ${postId}, title: ${title}, content: ${content}`);
  
      // ✅ البحث عن البوست والتحقق من مالكه
      const existingPost = await this.prisma.post.findUnique({
        where: { id: Number(postId) },
      });
  
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }
  
      if (existingPost.userId !== userId) {  
        throw new ForbiddenException('You do not have permission to edit this post');
      }
  
      // ✅ تحديث البوست
      return await this.prisma.post.update({
        where: { id: Number(postId) },
        data: { title, content },
      });
    } catch (error) {
      this.logger.error('Error updating post', error.stack);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }
    

  async deletePost(userId: number, postId: number): Promise<Post> {
    try {
      this.logger.log(`Deleting postId: ${postId} for userId: ${userId}`);
      const existingPost = await this.prisma.post.findUnique({ where: { id: postId } });
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }
      if (existingPost.userId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this post');
      }
      return await this.prisma.post.delete({ where: { id: postId } });
    } catch (error) {
      this.logger.error('Error deleting post', error.stack);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }
}