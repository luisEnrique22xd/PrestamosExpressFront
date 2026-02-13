// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Obtenemos el token de las cookies 
  // Nota: Usar cookies es más seguro para Middlewares que localStorage
  const token = request.cookies.get('access_token')?.value;

  // 2. Definimos las rutas que queremos proteger
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // 3. Si intenta entrar al dashboard sin token, lo mandamos al login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 4. Configuramos en qué rutas debe ejecutarse este middleware
export const config = {
  matcher: ['/dashboard/:path*'], 
};