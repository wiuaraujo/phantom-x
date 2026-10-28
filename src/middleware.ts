import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção estrita de todas as rotas do dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("phantom_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("auth_required", "1");
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Cabeçalhos de Cibersegurança HTTP
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
