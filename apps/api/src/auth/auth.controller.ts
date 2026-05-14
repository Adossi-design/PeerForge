import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, OnboardingDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Clerk webhook endpoint
   * Called by Clerk when a user is created or updated
   */
  @Post('callback')
  async handleClerkWebhook(@Body() data: AuthDto) {
    if (!data.clerkId || !data.email || !data.username) {
      throw new BadRequestException('Missing required fields from Clerk');
    }

    const user = await this.authService.upsertUserFromClerk(data);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Complete user onboarding
   */
  @Post('onboarding')
  async completeOnboarding(
    @Req() req: any,
    @Body() data: OnboardingDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const user = await this.authService.completeOnboarding(userId, data);
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
    };
  }

  /**
   * Get current authenticated user
   */
  @Get('me')
  async getCurrentUser(@Req() req: any) {
    const clerkId = req.user?.sub;
    if (!clerkId) {
      throw new BadRequestException('User not authenticated');
    }

    const user = await this.authService.getCurrentUser(clerkId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return { user };
  }
}
