import { NextRequest, NextResponse } from "next/server";
import { createLead, findDuplicateLead } from "@/lib/repo/leads";
import { runAutomationForLead } from "@/lib/automation";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.WEBHOOK_SECRET;

    // Se a variável WEBHOOK_SECRET estiver configurada, exige no header Authorization: Bearer <secret>
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    // Tentar identificar a qual usuário esse lead pertence.
    let userId = body.userId;
    if (!userId) {
      // Pega o primeiro usuário admin (o dono do sistema)
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
        orderBy: { createdAt: "asc" },
      });
      if (!adminUser) {
        return NextResponse.json({ error: "No admin user found to assign lead" }, { status: 500 });
      }
      userId = adminUser.id;
    }

    // Checar lead duplicado (por whatsapp, telefone ou instagram)
    const duplicate = await findDuplicateLead(userId, {
      whatsapp: body.whatsapp,
      phone: body.phone,
      instagram: body.instagram,
    });

    if (duplicate) {
      // Se já existe, você pode optar por apenas retornar sucesso ou atualizar os dados.
      // Aqui, evitamos duplicar.
      return NextResponse.json({ message: "Lead already exists", leadId: duplicate.id }, { status: 200 });
    }

    // Criar o lead
    const lead = await createLead(userId, {
      name: body.name,
      phone: body.phone,
      whatsapp: body.whatsapp,
      instagram: body.instagram,
      source: body.source || "Webhook / API",
      mode: body.mode || "MODO_1", // Default para MODO_1 se não informado
    });

    // Disparar a automação (primeiro contato) em background
    // Não damos await para não travar a resposta do webhook enquanto a IA pensa/API externa responde
    runAutomationForLead(lead.id, userId).catch((err) => {
      console.error(`Erro rodando automação para o lead ${lead.id} via webhook:`, err);
    });

    return NextResponse.json({ ok: true, leadId: lead.id, message: "Lead created and automation triggered" }, { status: 201 });
  } catch (error) {
    console.error("Erro no webhook /api/webhooks/lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
