import { authOptions, registerUser } from '../auth';

describe('auth', () => {
  it('exports authOptions with correct structure', () => {
    expect(authOptions).toBeDefined();
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.pages?.signIn).toBe('/auth/signin');
    expect(authOptions.secret).toBeDefined();
  });

  it('exports registerUser function', () => {
    expect(typeof registerUser).toBe('function');
  });

  it('has callbacks defined', () => {
    expect(authOptions.callbacks).toBeDefined();
    expect(typeof authOptions.callbacks?.jwt).toBe('function');
    expect(typeof authOptions.callbacks?.session).toBe('function');
  });
});