import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otpCode: string;
}
