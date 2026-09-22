import { google } from "googleapis";
import prisma from "@/lib/prisma";

async function getAuthClient(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.googleRefreshToken) {
    console.warn(`Usuário ${userId} não possui conta Google conectada ou token de refresh.`);
    return null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    console.warn("GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET ausentes.");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime(),
  });

  // Listener para salvar novos tokens quando o SDK atualizá-los
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    }
  });

  return oauth2Client;
}

export async function createMeetingEvent(params: {
  userId: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  startTimeIso: string; // ex: 2026-09-25T14:00:00-03:00
  endTimeIso: string;
  description?: string;
}) {
  const auth = await getAuthClient(params.userId);
  if (!auth) {
    // Modo mock se não tiver credenciais configuradas
    return {
      ok: true,
      eventId: `mock_evt_${Date.now()}`,
      htmlLink: "https://calendar.google.com/calendar/event?eid=mock",
    };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    // Agora o evento sempre será na conta principal conectada pelo usuário
    const calendarId = "primary";

    const event = {
      summary: `Reunião c/ ${params.leadName}`,
      description: `Telefone: ${params.leadPhone}\n\n${params.description || "Reunião agendada pelo Assistente IA."}`,
      start: {
        dateTime: params.startTimeIso,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: params.endTimeIso,
        timeZone: "America/Sao_Paulo",
      },
      attendees: params.leadEmail ? [{ email: params.leadEmail }] : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: "all", // Garante que o Google envie o convite por e-mail para os attendees
    });

    return {
      ok: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error: any) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}
