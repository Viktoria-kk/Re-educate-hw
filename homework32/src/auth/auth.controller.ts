import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyUserDto } from './dto/verify-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('verify')
  @HttpCode(200)
  verify(@Body() dto: VerifyUserDto) {
    return this.authService.verifyUser(dto);
  }

  @Post('resend-verification')
  @HttpCode(200)
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(dto);
  }
}
