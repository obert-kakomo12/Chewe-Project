import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(email: string, pass: string, name: string, accessCode: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let role = 'Student';
    if (accessCode === process.env.EXEC_ACCESS_CODE) {
      role = 'Admin';
    } else if (accessCode === process.env.TEACHER_ACCESS_CODE) {
      role = 'Teacher';
    } else if (accessCode === process.env.STUDENT_ACCESS_CODE) {
      role = 'Student';
    } else {
      throw new UnauthorizedException('Invalid Access Code');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(pass, salt);

    const user = await this.usersService.create({
      email,
      password_hash,
      name,
      role,
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Don't throw error to prevent email enumeration, just return
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    
    // Set expiration to 1 hour from now
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.saveResetToken(user.id, hash, expires);

    // Send email via nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587') || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://13.140.177.98:5173';
    const resetLink = `${frontendUrl}/?reset=true&token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      await transporter.sendMail({
        from: '"Support" <support@chewetech.com>',
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
    } catch (e) {
      console.error('Failed to send email. Check SMTP config.', e);
    }

    return { 
      message: 'If that email exists, a reset link has been sent.',
      resetLink: resetLink
    };
  }

  async resetPassword(email: string, token: string, newPass: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !user.reset_token || !user.reset_token_expires) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    if (new Date() > user.reset_token_expires) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const isValid = await bcrypt.compare(token, user.reset_token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(newPass, salt);

    await this.usersService.updatePassword(user.id, newHash);
    await this.usersService.clearResetToken(user.id);

    return { message: 'Password has been successfully reset.' };
  }
}
