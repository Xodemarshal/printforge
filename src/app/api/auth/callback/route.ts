import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ensureUserProfile } from '@/lib/user-profile';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Determine redirection URL
  let redirectUrl = `${origin}${next}`;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  
  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}${next}`;
  }

  // Create the redirect response first so we can attach cookies directly to it
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (e) {
                // Ignore errors setting on cookieStore in static/edge phases
              }
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensureUserProfile(user);
        } catch (profileError) {
          console.error('Failed to bootstrap user profile:', profileError);
        }
      }
      return response;
    } else {
      console.error('Auth callback exchangeCodeForSession failed:', error);
      return NextResponse.redirect(`${origin}/login?error=auth-callback-error&message=${encodeURIComponent(error.message)}`);
    }
  } else {
    console.error('Auth callback received request without code query param. Request URL:', request.url);
    return NextResponse.redirect(`${origin}/login?error=auth-callback-error&message=No+code+verifier+found`);
  }
}
