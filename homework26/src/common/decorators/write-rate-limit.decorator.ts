import { Throttle } from '@nestjs/throttler';

export const WriteRateLimit = () =>
  Throttle({
    default: {
      ttl: 60_000,
      limit: 5,
    },
  });
