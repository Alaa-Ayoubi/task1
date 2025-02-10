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
    console.log(`🔥 Service: updatePost called with postId: ${postId}, userId: ${userId}, title: ${title}, content: ${content}`);
  
    const existingPost = await this.prisma.post.findUnique({
      where: {id: Number(postId) },
    });
  
    if (!existingPost) {
      console.log('❌ Post not found');
      throw new NotFoundException('Post not found');
    }
  
    if (existingPost.userId !== userId) {  
      console.log('⛔ Forbidden: User does not own this post');
      throw new ForbiddenException('You do not have permission to edit this post');
    }
  
    console.log('✅ Post found, updating...');
    return await this.prisma.post.update({
      where: { id: Number(postId) },
      data: { title, content },
    });
  }
  
    

  async deletePost(userId: number, postId: number): Promise<Post> {
    console.log(`🔍 Checking post ownership: postId = ${postId}, userId = ${userId}`);
  
    const existingPost = await this.prisma.post.findUnique({ where: { id: postId } });
  
    if (!existingPost) {
      console.log('❌ Post not found');
      throw new NotFoundException('Post not found');
    }
  
    if (existingPost.userId !== userId) {
      console.log('⛔ Forbidden: User does not own this post');
      throw new ForbiddenException('You do not have permission to delete this post');
    }
  
    console.log('✅ Post found, deleting...');
    return await this.prisma.post.delete({ where: { id: postId } });
  }
  
}