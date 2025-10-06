import { createClient } from '../client';

describe('Supabase Client', () => {
  it('exports createClient function', () => {
    expect(typeof createClient).toBe('function');
  });

  it('createClient returns a value', () => {
    const result = createClient();
    expect(result).toBeDefined();
  });
});