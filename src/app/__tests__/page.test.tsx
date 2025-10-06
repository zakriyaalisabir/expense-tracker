import { redirect } from 'next/navigation';
import Root from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

describe('Root Page', () => {
  it('redirects to /home', () => {
    Root();
    expect(redirect).toHaveBeenCalledWith('/home');
  });
});