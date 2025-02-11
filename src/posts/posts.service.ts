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
      return await this.prisma.post.findMany({ where: { userId } });
    } catch (error) {
      this.logger.error('Error fetching posts', error.stack);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async createPost(userId: number, title: string, content: string): Promise<Post> {
    try {
      if (!title || !content) {
        throw new BadRequestException('Title and content cannot be empty');
      }

      this.logger.log(`Creating post for userId: ${userId}`);
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
      this.logger.log(`Updating postId: ${postId} for userId: ${userId}`);

      const existingPost = await this.prisma.post.findUnique({ where: { id: postId } });

      if (!existingPost) {
        this.logger.warn(`Post not found: ${postId}`);
        throw new NotFoundException('Post not found');
      }

      if (existingPost.userId !== userId) {
        this.logger.warn(`Unauthorized update attempt for post: ${postId}`);
        throw new ForbiddenException('You do not have permission to edit this post');
      }

      return await this.prisma.post.update({
        where: { id: postId },
        data: { title, content },
      });
    } catch (error) {
      this.logger.error('Error updating post', error.stack);
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async deletePost(userId: number, postId: number): Promise<Post> {
    try {
      this.logger.log(`Attempting to delete postId: ${postId} for userId: ${userId}`);

      const existingPost = await this.prisma.post.findUnique({ where: { id: postId } });

      if (!existingPost) {
        this.logger.warn(`Post not found: ${postId}`);
        throw new NotFoundException('Post not found');
      }

      if (existingPost.userId !== userId) {
        this.logger.warn(`Unauthorized delete attempt for post: ${postId}`);
        throw new ForbiddenException('You do not have permission to delete this post');
      }

      this.logger.log(`Deleting postId: ${postId}`);
      return await this.prisma.post.delete({ where: { id: postId } });
    } catch (error) {
      this.logger.error('Error deleting post', error.stack);
      throw new InternalServerErrorException('Failed to delete post');
    }
  }
}
