import { describe, it, expect } from 'vitest';
import { authConfig } from '@/auth.config';

describe('Auth middleware / callbacks.authorized', () => {
  it('should deny access (return false) for unauthenticated access to /admin', () => {
    const nextUrl = new URL('http://localhost/admin');
    const result = authConfig.callbacks?.authorized?.({
      auth: null,
      request: { nextUrl } as any,
    });
    expect(result).toBe(false);
  });

  it('should allow access (return true) for authenticated access to /admin', () => {
    const nextUrl = new URL('http://localhost/admin');
    const result = authConfig.callbacks?.authorized?.({
      auth: { user: { id: '1' }, expires: '' },
      request: { nextUrl } as any,
    });
    expect(result).toBe(true);
  });

  it('should allow access (return true) for unauthenticated access to /admin/login', () => {
    const nextUrl = new URL('http://localhost/admin/login');
    const result = authConfig.callbacks?.authorized?.({
      auth: null,
      request: { nextUrl } as any,
    });
    expect(result).toBe(true);
  });

  it('should redirect authenticated users from /admin/login to /admin', () => {
    const nextUrl = new URL('http://localhost/admin/login');
    const result = authConfig.callbacks?.authorized?.({
      auth: { user: { id: '1' }, expires: '' },
      request: { nextUrl } as any,
    });
    expect(result).toBeInstanceOf(Response);
    const redirectUrl = (result as Response).headers.get('Location');
    expect(redirectUrl).toBe('http://localhost/admin');
  });
});
