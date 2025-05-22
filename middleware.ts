import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Run middleware for all routes except static/image assets and file types
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - /_next/static/*
     * - /_next/image/*
     * - /favicon.ico
     * - Static assets (e.g. .png, .jpg, .svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};