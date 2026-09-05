import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetStoreSlugAndPath = vi.fn();
vi.mock('@/auth.config', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    authConfig: {
      ...actual.authConfig,
    }
  };
});

// Since auth.config.ts uses our helper internally, we just test the authorized callback.
// We'll import it fresh.
import { authConfig } from '../auth.config';

describe('Auth middleware / callbacks.authorized', () => {
  const authorized = authConfig.callbacks!.authorized as any;

  it('should deny access (return false) for unauthenticated access to /admin', () => {
    const nextUrl = new URL('http://localhost/admin');
    const request = { nextUrl, headers: new Headers({ "host": "localhost" }) };
    const auth = null;
    
    // According to our new logic, it redirects to /admin/login when not authenticated!
    const result = authorized({ auth, request });
    expect(result).toBeInstanceOf(Response); // Redirect response
    expect(result.headers.get("location")).toContain("/admin/login");
  });

  it('should allow access (return true) for authenticated access to /admin', () => {
    const nextUrl = new URL('http://localhost/admin');
    const request = { nextUrl, headers: new Headers({ "host": "localhost" }) };
    const auth = { user: { id: '1' } };

    const result = authorized({ auth, request });
    expect(result).toBe(true);
  });

  it('should allow access (return true) for unauthenticated access to /admin/login', () => {
    const nextUrl = new URL('http://localhost/admin/login');
    const request = { nextUrl, headers: new Headers({ "host": "localhost" }) };
    const auth = null;

    const result = authorized({ auth, request });
    expect(result).toBe(true);
  });

  it('should redirect authenticated users from /admin/login to /admin', () => {
    const nextUrl = new URL('http://localhost/admin/login');
    const request = { nextUrl, headers: new Headers({ "host": "localhost" }) };
    const auth = { user: { id: '1' } };

    const result = authorized({ auth, request });
    expect(result).toBeInstanceOf(Response); // next-auth v5 returns Response.redirect
    
    // We can't strictly assert the Response object URL natively in all vitest setups without a bit of work, 
    // but we can check headers.get('location')
    const redirectUrl = result.headers.get('location');
    expect(redirectUrl).toContain('/admin');
  });
});
