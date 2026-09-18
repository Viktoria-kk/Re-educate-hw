import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const usersRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const emailSenderService = { sendDeactivation: jest.fn() };
  const service = new UsersService(
    usersRepository as never,
    emailSenderService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('soft-deactivates the current user and sends an email', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      isActive: true,
      deactivatedAt: null,
    };
    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);
    emailSenderService.sendDeactivation.mockResolvedValue(undefined);

    await expect(service.deactivateCurrentUser(user.id)).resolves.toEqual({
      success: true,
      message: 'Account deactivated successfully',
    });
    expect(user.isActive).toBe(false);
    expect(user.deactivatedAt).toBeInstanceOf(Date);
    expect(emailSenderService.sendDeactivation).toHaveBeenCalledWith(
      user.email,
    );
  });

  it('does not deactivate a missing or already inactive user', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.deactivateCurrentUser('missing-id')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
    expect(emailSenderService.sendDeactivation).not.toHaveBeenCalled();
  });
});
