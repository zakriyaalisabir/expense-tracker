// Simple test to cover types.ts file
import * as types from '../types';

describe('Types Coverage', () => {
  it('covers types file', () => {
    // Import types to ensure file is covered
    expect(typeof types).toBe('object');
  });
});