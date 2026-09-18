import { EmailSenderService } from './email-sender.service';

describe('EmailSenderService', () => {
  const mailerService = { sendMail: jest.fn() };
  const service = new EmailSenderService(mailerService as never);

  beforeEach(() => {
    jest.clearAllMocks();
    mailerService.sendMail.mockResolvedValue(undefined);
  });

  it('sends the OTP in both text and HTML content', async () => {
    await service.sendOtp('user@example.com', '123456');

    const calls = mailerService.sendMail.mock.calls as unknown as [
      [Record<'to' | 'subject' | 'text' | 'html', string>],
    ];
    const options = calls[0][0];
    expect(options.to).toBe('user@example.com');
    expect(options.subject).toContain('123456');
    expect(options.text).toContain('123456');
    expect(options.html).toContain('123456');
  });

  it('sends a welcome email', async () => {
    await service.sendWelcome('user@example.com');
    const calls = mailerService.sendMail.mock.calls as unknown as [
      [{ to: string; subject: string }],
    ];
    const options = calls[0][0];
    expect(options.to).toBe('user@example.com');
    expect(options.subject).toContain('Welcome');
  });

  it('sends an account-deactivation email', async () => {
    await service.sendDeactivation('user@example.com');
    const calls = mailerService.sendMail.mock.calls as unknown as [
      [{ to: string; subject: string }],
    ];
    const options = calls[0][0];
    expect(options.to).toBe('user@example.com');
    expect(options.subject).toContain('deactivated');
  });
});
