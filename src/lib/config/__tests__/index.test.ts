import { config } from '../index';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Reset the config cache by requiring a fresh import
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return config with all properties', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.NODE_ENV = 'test';
    
    expect(config.supabase.url).toBe('test-url');
    expect(config.supabase.anonKey).toBe('test-key');
    expect(config.app.environment).toBe('test');
  });

  it('should use defaults for missing env vars', () => {
    delete process.env.LOG_LEVEL;
    delete process.env.NEXT_PUBLIC_DEMO_ENABLED;
    
    expect(config.app.logLevel).toBe('info');
    expect(config.app.demoEnabled).toBe(false);
  });

  it('should parse boolean flags correctly', async () => {
    process.env.NEXT_PUBLIC_FEATURE_MULTI_CURRENCY = 'false';
    process.env.NEXT_PUBLIC_FEATURE_REALTIME_SYNC = 'true';
    
    // Re-import config to get fresh instance
    const { config: freshConfig } = await import('../index');
    expect(freshConfig.features.multiCurrency).toBe(false);
    expect(freshConfig.features.realTimeSync).toBe(true);
  });
});