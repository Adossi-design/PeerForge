import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto, AddSkillDto } from './dto/user.dto';
import { clampInt } from '@/common/pagination';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user profile by ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return { user };
  }

  /**
   * Get user profile by username
   */
  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);
    return { user };
  }

  /**
   * Update user profile
   */
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() data: UpdateUserProfileDto,
  ) {
    const user = await this.usersService.updateProfile(id, data);
    return { user };
  }

  /**
   * Add skill to user
   */
  @Post(':id/skills')
  async addSkill(@Param('id') userId: string, @Body() data: AddSkillDto) {
    const skill = await this.usersService.addSkill(userId, data);
    return { skill };
  }

  /**
   * Search users
   */
  @Get('search/:query')
  async searchUsers(
    @Param('query') query: string,
    @Query('limit') limit: string = '20',
  ) {
    const users = await this.usersService.searchUsers(query, clampInt(limit, 20, 50));
    return { users };
  }
}
