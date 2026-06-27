import { Controller, Get, Patch, Post, Body, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private extractUserId(authHeader?: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('me')
  async getMyProfile(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
    };
  }

  @Patch('me')
  async updateMyProfile(@Headers('authorization') authHeader: string, @Body() body: { name?: string; profilePicture?: string }) {
    const userId = this.extractUserId(authHeader);

    await this.usersService.updateProfile(userId, body.name, body.profilePicture);
    return { success: true, message: 'Profile updated successfully' };
  }

  @Post('me/password')
  async updateMyPassword(@Headers('authorization') authHeader: string, @Body() body: { currentPassword?: string; newPassword?: string }) {
    const userId = this.extractUserId(authHeader);
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Current and new password are required');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(body.currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.newPassword, salt);
    await this.usersService.updatePassword(userId, hash);
    return { success: true, message: 'Password updated successfully' };
  }
}
