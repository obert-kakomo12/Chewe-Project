import { Controller, Get, Patch, Post, Delete, Body, Headers, UnauthorizedException, BadRequestException, Param } from '@nestjs/common';
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

  @Post()
  async createUser(@Headers('authorization') authHeader: string, @Body() body: any) {
    const userId = this.extractUserId(authHeader);
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Executive')) {
      throw new UnauthorizedException('Only Admins/Executives can create users');
    }

    if (!body.name || !body.email || !body.role) {
      throw new BadRequestException('Name, email, and role are required');
    }

    const existing = await this.usersService.findOneByEmail(body.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password || 'password123', salt);
    
    const newUser = await this.usersService.create({
      name: body.name,
      email: body.email,
      role: body.role,
      password_hash: hash
    });

    return { success: true, message: 'User created', user: newUser };
  }

  @Get('staff')
  async getStaff(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    const user = await this.usersService.findById(userId);
    if (!user || user.role !== 'Executive') {
      throw new UnauthorizedException('Only Executives can view the staff roster');
    }
    return this.usersService.findStaff();
  }

  @Delete(':id')
  async deleteStaff(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    const userId = this.extractUserId(authHeader);
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser || currentUser.role !== 'Executive') {
      throw new UnauthorizedException('Only Executives can delete staff');
    }
    await this.usersService.deleteUser(Number(id));
    return { success: true, message: 'User deleted' };
  }
}
