import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // If env vars are missing, bypass auth to avoid 500s in production
  // and let the app render client-side (AuthGuard will still protect UI).
  let response = NextResponse.next();
  if (hasSupabaseEnv) {
    try {
      response = await updateSession(request);
    } catch (_err) {
      // In case updateSession throws, keep response as NextResponse.next()
      // to avoid hard-failing requests.
      response.headers.set('x-auth-warning', 'supabase-session-update-failed');
    }
  } else {
    response.headers.set('x-auth-warning', 'missing-supabase-env');
  }

  const { pathname } = request.nextUrl;
  const publicPaths = ['/auth', '/auth/callback'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Honor demo-mode via cookie so that server-side middleware allows access
  const demoCookie = request.cookies.get('demo-mode')?.value;
  const demoEnabled = process.env.PUBLIC_DEMO_ENABLED === 'true';
  const isDemo = demoEnabled && demoCookie === 'true';

  if (!isPublicPath && !isDemo && hasSupabaseEnv) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
