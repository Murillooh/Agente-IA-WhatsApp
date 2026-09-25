import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("Nenhum usuário encontrado");
    return;
  }
  
  console.log("User:", user.email);
  console.log("Has Access Token:", !!user.googleAccessToken);
  console.log("Has Refresh Token:", !!user.googleRefreshToken);
  console.log("Expiry Date:", user.googleTokenExpiry);
  
  if (!user.googleRefreshToken) {
      console.log("No refresh token found. Mock mode would be used.");
      return;
  }
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  console.log("Client ID:", !!clientId);
  console.log("Client Secret:", !!clientSecret);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime(),
  });
  
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  try {
      const res = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
              summary: "Test Event",
              start: { dateTime: new Date().toISOString() },
              end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
          }
      });
      console.log("Event created successfully:", res.data.htmlLink);
  } catch (err) {
      console.error("Error creating event:", err.message);
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
