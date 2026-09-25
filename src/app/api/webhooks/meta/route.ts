import { NextRequest, NextResponse } from "next/server";
import { createLead, findDuplicateLead } from "@/lib/repo/leads";
import { runAutomationForLead } from "@/lib/automation";
import prisma from "@/lib/prisma";

// GET: Verificação do Webhook pela Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

// POST: Recebimento dos dados (Lead Ads)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // A Meta envia webhooks no formato de 'entries'
    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadgenId = change.value.leadgen_id;
            
            // Fazer fetch na Graph API da Meta para pegar os detalhes do Lead
            const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
            
            if (!pageAccessToken) {
              console.error("META_PAGE_ACCESS_TOKEN não configurado.");
              return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
            }

            const graphApiUrl = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${pageAccessToken}`;
            
            const metaRes = await fetch(graphApiUrl);
            const metaData = await metaRes.json();

            if (metaData.error) {
              console.error("Erro ao buscar dados na Meta:", metaData.error);
              continue;
            }

            // O metaData.field_data é um array com os campos preenchidos no formulário
            // Exemplo: [{name: "full_name", values: ["Murillo Silva"]}, {name: "phone_number", values: ["+5511999999999"]}]
            let name = "Lead Instagram";
            let phone = "";
            let email = "";

            if (metaData.field_data) {
              for (const field of metaData.field_data) {
                if (field.name === "full_name" || field.name === "first_name") {
                  name = field.values[0];
                }
                if (field.name === "phone_number") {
                  phone = field.values[0];
                }
                if (field.name === "email") {
                  email = field.values[0];
                }
              }
            }

            // Limpa o telefone para o formato numérico (tira o +, traços, etc)
            let whatsapp = phone.replace(/\D/g, "");

            if (!whatsapp) {
              console.error("Lead capturado sem telefone. Ignorando.");
              continue;
            }

            // Atribuir ao primeiro admin (ou dono do sistema)
            const adminUser = await prisma.user.findFirst({
              where: { isAdmin: true },
              orderBy: { createdAt: "asc" },
            });

            if (!adminUser) {
              console.error("Nenhum usuário admin encontrado.");
              continue;
            }

            const userId = adminUser.id;

            // Checar duplicidade
            const duplicate = await findDuplicateLead(userId, { whatsapp });

            if (!duplicate) {
              // Criar Lead
              const lead = await createLead(userId, {
                name,
                phone: whatsapp,
                whatsapp,
                source: "Instagram Lead Ads",
                mode: "MODO_1", // Dispara contato ativo da IA
              });

              // Disparar Automação IA
              runAutomationForLead(lead.id, userId).catch((err) => {
                console.error(`Erro rodando automação para o lead ${lead.id} do IG:`, err);
              });
              
              console.log("Lead do Instagram processado com sucesso:", lead.id);
            } else {
              console.log("Lead duplicado ignorado do Instagram:", duplicate.id);
            }
          }
        }
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Erro no webhook Meta:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
