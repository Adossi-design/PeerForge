import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Get public feed
   */
  @Get()
  async getFeed(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    const posts = await this.postsService.getFeed(
      parseInt(skip),
      parseInt(take),
    );
    return { posts };
  }

  /**
   * Get single post
   */
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return { post };
  }

  /**
   * Create post
   */
  @Post()
  async createPost(@Req() req: any, @Body() data: CreatePostDto) {
    let userId = req.user?.id;
    
    // Development: Allow test user ID header or use default
    if (!userId) {
      if (process.env.NODE_ENV !== 'production') {
        userId = req.headers['x-user-id'] || 'dev-user-' + Date.now();
      } else {
        throw new BadRequestException('User not authenticated');
      }
    }

    const post = await this.postsService.createPost(userId, data);
    return { post };
  }

  /**
   * Update post
   */
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Req() req: any,
    @Body() data: UpdatePostDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const post = await this.postsService.updatePost(id, userId, data);
    return { post };
  }

  /**
   * Delete post
   */
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.postsService.deletePost(id, userId);
    return { success: true };
  }

  /**
   * Search posts
   */
  @Get('search/:query')
  async searchPosts(
    @Param('query') query: string,
    @Query('tags') tags: string = '',
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    const tagArray = tags ? tags.split(',') : [];
    const posts = await this.postsService.searchPosts(
      query,
      tagArray,
      parseInt(skip),
      parseInt(take),
    );
    return { posts };
  }

  /**
   * Get user's posts
   */
  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    const posts = await this.postsService.getUserPosts(
      userId,
      parseInt(skip),
      parseInt(take),
    );
    return { posts };
  }

  /**
   * Like/Unlike post
   */
  @Post(':id/like')
  async likePost(@Param('id') postId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const result = await this.postsService.likePost(postId, userId);
    return result;
  }

  /**
   * Save/Unsave post
   */
  @Post(':id/save')
  async savePost(@Param('id') postId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const result = await this.postsService.savePost(postId, userId);
    return result;
  }
}
