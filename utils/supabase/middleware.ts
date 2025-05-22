import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname === '/';

  console.log('Middleware: pathname:', pathname, 'user:', !!user, 'isPublic:', isPublic);

  // Unauthenticated user tries to access private route
  if (!user && !isPublic) {
    console.log('Redirecting unauthenticated user to login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url, 302);
  }

  // Authenticated user tries to access login page - redirect to home
  if (user && pathname.startsWith('/login')) {
    console.log('Redirecting authenticated user to home');
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 302);
  }

  return supabaseResponse;
}