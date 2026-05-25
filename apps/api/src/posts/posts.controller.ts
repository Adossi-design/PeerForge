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
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { clampInt, SKIP_DEFAULT, SKIP_MAX, TAKE_DEFAULT, TAKE_MAX } from '@/common/pagination';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Get public feed
   */
  @Get('saved')
  async getSavedPosts(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const posts = await this.postsService.getSavedPosts(userId);
    return { posts };
  }

  @Get()
  async getFeed(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
    @Req() req: AuthenticatedRequest,
  ) {
    const posts = await this.postsService.getFeed(
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
      req.user?.id,
    );
    return { posts };
  }

  /**
   * Get single post
   */
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const post = await this.postsService.getPostById(id, req.user?.id);
    return { post };
  }

  /**
   * Create post
   */
  @Post()
  async createPost(@Req() req: AuthenticatedRequest, @Body() data: CreatePostDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const post = await this.postsService.createPost(userId, data);
    return { post };
  }

  /**
   * Update post
   */
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdatePostDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const post = await this.postsService.updatePost(id, userId, data);
    return { post };
  }

  /**
   * Delete post
   */
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
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
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
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
    @Req() req: AuthenticatedRequest,
  ) {
    const posts = await this.postsService.getUserPosts(
      userId,
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
      req.user?.id,
    );
    return { posts };
  }

  /**
   * Like/Unlike post
   */
  @Post(':id/like')
  async likePost(@Param('id') postId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.postsService.likePost(postId, userId);
    return result;
  }

  /**
   * Save/Unsave post
   */
  @Post(':id/save')
  async savePost(@Param('id') postId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.postsService.savePost(postId, userId);
  }

  @Post(':id/share')
  async sharePost(@Param('id') postId: string) {
    return this.postsService.sharePost(postId);
  }

  /** Public — anyone can see who liked a post. */
  @Get(':id/likes')
  async getLikers(
    @Param('id') postId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '50',
  ) {
    const users = await this.postsService.getPostLikers(
      postId,
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
    );
    return { users };
  }
}
