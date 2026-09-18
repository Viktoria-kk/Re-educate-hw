import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const queryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  const usersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const jwtService = { signAsync: jest.fn() };
  const emailSenderService = {
    sendOtp: jest.fn(),
    sendWelcome: jest.fn(),
  };
  const service = new AuthService(
    usersRepository as never,
    jwtService as never,
    emailSenderService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    usersRepository.createQueryBuilder.mockReturnValue(queryBuilder);
  });

  it('creates an unverified user and emails a six-digit OTP', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue({ id: 'user-id' });
    usersRepository.save.mockResolvedValue({ id: 'user-id' });
    emailSenderService.sendOtp.mockResolvedValue(undefined);

    await expect(
      service.signUp({
        email: ' USER@example.com ',
        fullName: 'Test User',
        password: 'password123',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Check your email for the OTP code',
    });

    expect(emailSenderService.sendOtp).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringMatching(/^\d{6}$/),
    );
    const createCalls = usersRepository.create.mock.calls as unknown as [
      [
        {
          email: string;
          otpCodeHash: string;
          otpExpiresAt: Date;
        },
      ],
    ];
    const createdUser = createCalls[0][0];
    expect(createdUser.email).toBe('user@example.com');
    expect(createdUser.otpCodeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createdUser.otpExpiresAt).toBeInstanceOf(Date);
  });

  it('rejects duplicate sign-up emails', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.signUp({
        email: 'user@example.com',
        fullName: 'Test User',
        password: 'password123',
      }),
    ).rejects.toThrow(new BadRequestException('User already exists'));
  });

  it('verifies a valid OTP, clears it, and sends the welcome email', async () => {
    const otpCode = '123456';
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      isActive: true,
      isVerified: false,
      otpCodeHash: createHash('sha256').update(otpCode).digest('hex'),
      otpExpiresAt: new Date(Date.now() + 60_000),
    };
    queryBuilder.getOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);
    emailSenderService.sendWelcome.mockResolvedValue(undefined);
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.verifyUser({ email: user.email, otpCode }),
    ).resolves.toEqual({ accessToken: 'signed-token' });

    expect(user).toEqual(
      expect.objectContaining({
        isVerified: true,
        otpCodeHash: null,
        otpExpiresAt: null,
      }),
    );
    expect(emailSenderService.sendWelcome).toHaveBeenCalledWith(user.email);
  });

  it('rejects an expired OTP', async () => {
    const otpCode = '123456';
    queryBuilder.getOne.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      isActive: true,
      isVerified: false,
      otpCodeHash: createHash('sha256').update(otpCode).digest('hex'),
      otpExpiresAt: new Date(Date.now() - 1),
    });

    await expect(
      service.verifyUser({ email: 'user@example.com', otpCode }),
    ).rejects.toThrow(new BadRequestException('OTP code has expired'));
    expect(emailSenderService.sendWelcome).not.toHaveBeenCalled();
  });

  it('resends an OTP only after the old code expires', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      isActive: true,
      isVerified: false,
      otpCodeHash: null,
      otpExpiresAt: new Date(Date.now() - 1),
    };
    queryBuilder.getOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);
    emailSenderService.sendOtp.mockResolvedValue(undefined);

    await expect(
      service.resendVerificationCode({ email: user.email }),
    ).resolves.toEqual({ success: true, message: 'A new OTP code was sent' });
    expect(emailSenderService.sendOtp).toHaveBeenCalledWith(
      user.email,
      expect.stringMatching(/^\d{6}$/),
    );
  });
});
