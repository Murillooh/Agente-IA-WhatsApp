import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth/token";

// Next 16 renomeou middleware.js -> proxy.js (mesma coisa, roda em Node
// runtime por padrão agora, é por isso que dá pra usar crypto nativo
// direto em token.ts sem drama de Edge runtime).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  // Login/cadastro (páginas e as próprias rotas de POST) sempre acessíveis.
  const authPages = ["/login", "/signup"];
  const authApis = ["/api/auth/login", "/api/auth/signup"];
  if (authPages.includes(pathname) || authApis.includes(pathname)) {
    if (authPages.includes(pathname) && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Cron (Vercel Cron ou teste manual) não manda cookie de sessão — a
  // própria rota confere o header Authorization contra CRON_SECRET.
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
