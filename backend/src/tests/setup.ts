import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock Redis
jest.mock('../database/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    sadd: jest.fn(),
    srem: jest.fn(),
    hset: jest.fn(),
    lpush: jest.fn(),
    ltrim: jest.fn(),
  },
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  cacheDelete: jest.fn().mockResolvedValue(undefined),
  cacheDeletePattern: jest.fn().mockResolvedValue(undefined),
}));

// Global test timeout
jest.setTimeout(10000);

beforeAll(() => {
  console.log('Starting tests...');
});

afterAll(() => {
  console.log('Tests completed.');
});
