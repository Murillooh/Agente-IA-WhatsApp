import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL("/settings/integrations?error=google_auth_failed", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings/integrations?error=no_code", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Credenciais do Google não configuradas." }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token, // pode ser undefined se o usuário não aceitar offline type ou se reconectar sem forçar consent
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    return NextResponse.redirect(new URL("/settings/integrations?success=google_connected", req.url));
  } catch (err) {
    console.error("Erro ao trocar o código OAuth por tokens:", err);
    return NextResponse.redirect(new URL("/settings/integrations?error=token_exchange_failed", req.url));
  }
}
