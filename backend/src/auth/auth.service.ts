import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as path from 'path';

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

  async forgotPassword(email: string, origin?: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Don't throw error to prevent email enumeration, just return
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
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

    const frontendUrl = origin || process.env.FRONTEND_URL || 'http://13.140.177.98:5173';
    const resetLink = `${frontendUrl}/?reset=true&token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      await transporter.sendMail({
        from: '"Support" <support@chewetechnologies.co.zw>',
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo" alt="Chewe Technology Logo" style="height: 50px; object-fit: contain;" />
            </div>
            <h2 style="color: #0d1f45; text-align: center;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your account. Please click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If you did not request this reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message, please do not reply.</p>
          </div>
        `,
        attachments: [{
          filename: 'logo.png',
          path: path.join(process.cwd(), '..', 'src', 'assets', 'logo_no_bg.png'),
          cid: 'logo'
        }]
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

    if (Date.now() > Number(user.reset_token_expires)) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const isValid = hash === user.reset_token;
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
