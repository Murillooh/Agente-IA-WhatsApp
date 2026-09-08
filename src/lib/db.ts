import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { hashPassword } from "@/lib/auth/password";

// Banco local em arquivo (SQLite). Para produção real, troque por Postgres/Turso
// e adapte as funções em src/lib/repo/*.ts — a interface (o que cada função
// recebe e devolve) pode continuar igual para o resto do app não precisar mudar.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");

declare global {
  var __db: Database.Database | undefined;
}

export const db = global.__db ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Registro append-only de mutação sensível (status de lead, exclusão,
-- troca de senha) — só leitura pela tela de administração, nunca editado.
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

-- Cada lead pertence a um usuário — é o que isola os dados entre contas
-- (reuniões e timeline seguem o lead, não precisam de user_id próprio).
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  source TEXT,
  mode TEXT NOT NULL DEFAULT 'MODO_1' CHECK (mode IN ('MODO_1','MODO_2')),
  status TEXT NOT NULL DEFAULT 'NOVO' CHECK (status IN ('NOVO','CONTATADO','RESPONDENDO','REUNIAO_AGENDADA','FECHADO','PERDIDO')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP','INSTAGRAM','LIGACAO','SISTEMA')),
  direction TEXT NOT NULL CHECK (direction IN ('SAIDA','ENTRADA')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA','REALIZADA','CANCELADA')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Scripts de vendas continuam compartilhados por toda a equipe (são
-- modelos/playbook, não dado sensível de cada usuário).
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('MODO_1','MODO_2')),
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP','INSTAGRAM','LIGACAO')),
  content TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_lead ON conversation_events(lead_id);
`);

seedAdminIfEmpty();
const legacyOwnerId = resolveLegacyDataOwnerId();
migrateLeadsUserId(legacyOwnerId);
migrateUsersIsAdmin();
// Só depois da migração é que a coluna user_id existe garantidamente em
// bancos antigos — por isso esse índice não entra no bloco de exec() lá
// em cima (senão quebra em qualquer banco criado antes dessa mudança).
db.exec("CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id)");
seedIfEmpty(legacyOwnerId);

// Dono dos leads que já existiam antes do conceito de usuário (ou dos
// leads de exemplo, num banco novo): prioriza a conta pessoal se ela
// existir nesta máquina, senão cai na primeira conta que houver.
function resolveLegacyDataOwnerId(): string {
  const preferred = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("muurisattos@gmail.com") as { id: string } | undefined;
  if (preferred) return preferred.id;

  const first = db.prepare("SELECT id FROM users ORDER BY created_at ASC LIMIT 1").get() as
    | { id: string }
    | undefined;
  // seedAdminIfEmpty() já garantiu que existe pelo menos um usuário antes
  // desta função ser chamada.
  return first!.id;
}

// Bancos criados antes do login existir têm a tabela "leads" sem a coluna
// user_id — SQLite não deixa adicionar coluna NOT NULL numa tabela que já
// tem linhas, então ela entra opcional e a gente preenche na mão.
function migrateLeadsUserId(fallbackUserId: string) {
  const columns = db.prepare("PRAGMA table_info(leads)").all() as { name: string }[];
  if (columns.some((c) => c.name === "user_id")) return;

  db.exec("ALTER TABLE leads ADD COLUMN user_id TEXT REFERENCES users(id)");
  db.prepare("UPDATE leads SET user_id = ? WHERE user_id IS NULL").run(fallbackUserId);
}

// Bancos criados antes do conceito de admin têm a tabela "users" sem a
// coluna is_admin — mesma mecânica de migrateLeadsUserId. Depois de
// garantir a coluna, a conta pessoal sempre vira admin (idempotente:
// roda toda subida, não só na primeira vez que a coluna é criada).
function migrateUsersIsAdmin() {
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "is_admin")) {
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
  }
  db.prepare("UPDATE users SET is_admin = 1 WHERE username = ?").run("muurisattos@gmail.com");
}

function seedIfEmpty(userId: string) {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM leads").get() as {
    count: number;
  };
  if (count > 0) return;

  const now = new Date();
  const iso = (offsetHours = 0) =>
    new Date(now.getTime() + offsetHours * 3600 * 1000).toISOString();

  const insertLead = db.prepare(
    `INSERT INTO leads (id, user_id, name, phone, whatsapp, instagram, source, mode, status, created_at, updated_at)
     VALUES (@id, @user_id, @name, @phone, @whatsapp, @instagram, @source, @mode, @status, @created_at, @updated_at)`
  );
  const insertEvent = db.prepare(
    `INSERT INTO conversation_events (id, lead_id, channel, direction, content, created_at)
     VALUES (@id, @lead_id, @channel, @direction, @content, @created_at)`
  );
  const insertMeeting = db.prepare(
    `INSERT INTO meetings (id, lead_id, scheduled_at, status, notes, created_at, updated_at)
     VALUES (@id, @lead_id, @scheduled_at, @status, @notes, @created_at, @updated_at)`
  );
  const insertScript = db.prepare(
    `INSERT INTO scripts (id, name, mode, channel, content, is_active, created_at, updated_at)
     VALUES (@id, @name, @mode, @channel, @content, 1, @created_at, @updated_at)`
  );

  const uid = () => crypto.randomUUID();

  // Scripts padrão
  insertScript.run({
    id: uid(),
    name: "Abordagem inicial - WhatsApp",
    mode: "MODO_1",
    channel: "WHATSAPP",
    content:
      "Oi {{nome}}! Aqui é da [Sua Empresa] 👋 Vi que você atua com [contexto do lead] e separei algo rápido que pode te ajudar a [benefício principal]. Faz sentido eu te mostrar em 15 min essa semana?",
    created_at: iso(),
    updated_at: iso(),
  });
  insertScript.run({
    id: uid(),
    name: "Abordagem inicial - Instagram",
    mode: "MODO_1",
    channel: "INSTAGRAM",
    content:
      "Oi {{nome}}, tudo bem? Curti seu conteúdo sobre [tema]! Trabalho ajudando [nicho] a [benefício principal] e queria entender melhor o seu momento. Topa bater 15 min essa semana?",
    created_at: iso(),
    updated_at: iso(),
  });
  insertScript.run({
    id: uid(),
    name: "Roteiro de ligação",
    mode: "MODO_2",
    channel: "LIGACAO",
    content:
      "1) Apresentação rápida e confirmação do momento certo para falar. 2) Pergunta de diagnóstico sobre o desafio atual. 3) Conectar o desafio ao benefício da solução. 4) Proposta objetiva de reunião com 2 horários. 5) Confirmar e reforçar por WhatsApp.",
    created_at: iso(),
    updated_at: iso(),
  });

  // Lead 1 - Modo 1, já com reunião agendada
  const lead1 = uid();
  insertLead.run({
    user_id: userId,
    id: lead1,
    name: "Marina Souza",
    phone: null,
    whatsapp: "+55 11 98888-0001",
    instagram: "@marina.souza",
    source: "Lista de prospecção - Instagram",
    mode: "MODO_1",
    status: "REUNIAO_AGENDADA",
    created_at: iso(-48),
    updated_at: iso(-2),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead1,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead importado da lista de prospecção (Instagram).",
    created_at: iso(-48),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead1,
    channel: "INSTAGRAM",
    direction: "SAIDA",
    content:
      "Oi Marina, tudo bem? Curti seu conteúdo sobre gestão financeira! Trabalho ajudando negócios como o seu a organizar o fluxo de caixa. Topa bater 15 min essa semana?",
    created_at: iso(-47),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead1,
    channel: "INSTAGRAM",
    direction: "ENTRADA",
    content: "Oi! Pode ser sim, tenho interesse. Quando você tem horário?",
    created_at: iso(-40),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead1,
    channel: "WHATSAPP",
    direction: "SAIDA",
    content: "Perfeito! Te mando aqui pelo WhatsApp pra combinar o melhor horário 🙂",
    created_at: iso(-39),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead1,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Reunião agendada para quinta-feira às 10h.",
    created_at: iso(-2),
  });
  insertMeeting.run({
    id: uid(),
    lead_id: lead1,
    scheduled_at: iso(72),
    status: "AGENDADA",
    notes: "Diagnóstico inicial + apresentação da proposta.",
    created_at: iso(-2),
    updated_at: iso(-2),
  });

  // Lead 2 - Modo 2, em andamento (ligação feita, aguardando resposta)
  const lead2 = uid();
  insertLead.run({
    user_id: userId,
    id: lead2,
    name: "Carlos Pereira",
    phone: "+55 21 97777-0002",
    whatsapp: "+55 21 97777-0002",
    instagram: null,
    source: "Lista de prospecção - CSV",
    mode: "MODO_2",
    status: "RESPONDENDO",
    created_at: iso(-24),
    updated_at: iso(-1),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead2,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead importado (Modo 2 - WhatsApp + Ligação).",
    created_at: iso(-24),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead2,
    channel: "WHATSAPP",
    direction: "SAIDA",
    content:
      "Oi Carlos! Aqui é da [Sua Empresa]. Separei algo rápido que pode ajudar sua operação a reduzir custos. Posso te ligar hoje à tarde?",
    created_at: iso(-23),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead2,
    channel: "LIGACAO",
    direction: "SAIDA",
    content:
      "Ligação realizada (4min12s). Resumo: Carlos confirmou interesse, pediu para reagendar a call de diagnóstico para depois das 17h.",
    created_at: iso(-3),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead2,
    channel: "WHATSAPP",
    direction: "ENTRADA",
    content: "Consegue amanhã às 17h30? Só termino uma reunião às 17h.",
    created_at: iso(-1),
  });

  // Lead 3 - Modo 1, recém contatado
  const lead3 = uid();
  insertLead.run({
    user_id: userId,
    id: lead3,
    name: "Fernanda Lima",
    phone: null,
    whatsapp: "+55 31 96666-0003",
    instagram: "@fernandalima.consultoria",
    source: "Lista de prospecção - WhatsApp",
    mode: "MODO_1",
    status: "CONTATADO",
    created_at: iso(-5),
    updated_at: iso(-5),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead3,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead importado da lista de prospecção (WhatsApp).",
    created_at: iso(-5),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead3,
    channel: "WHATSAPP",
    direction: "SAIDA",
    content:
      "Oi Fernanda! Aqui é da [Sua Empresa] 👋 Separei algo rápido que pode te ajudar a captar mais clientes. Faz sentido eu te mostrar em 15 min essa semana?",
    created_at: iso(-5),
  });

  // Lead 4 - Novo, sem contato ainda
  const lead4 = uid();
  insertLead.run({
    user_id: userId,
    id: lead4,
    name: "Rodrigo Alves",
    phone: "+55 41 95555-0004",
    whatsapp: "+55 41 95555-0004",
    instagram: null,
    source: "Lista de prospecção - CSV",
    mode: "MODO_2",
    status: "NOVO",
    created_at: iso(-1),
    updated_at: iso(-1),
  });
  insertEvent.run({
    id: uid(),
    lead_id: lead4,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead importado, aguardando início da automação (Modo 2).",
    created_at: iso(-1),
  });
}

// Cria a primeira conta pra você conseguir entrar no sistema. Depois de
// logar, é uma boa trocar a senha (hoje não tem tela pra isso — se
// precisar, dá pra rodar um UPDATE direto no banco com uma nova hash de
// src/lib/auth/password.ts).
function seedAdminIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "meetcloser123";

  // OR IGNORE: o build do Next roda essa checagem em vários workers ao
  // mesmo tempo, todos batendo no mesmo arquivo — sem isso, o segundo a
  // chegar quebra na constraint UNIQUE do username.
  const info = db
    .prepare(
      `INSERT OR IGNORE INTO users (id, username, name, password_hash, created_at)
       VALUES (@id, @username, @name, @password_hash, @created_at)`
    )
    .run({
      id: crypto.randomUUID(),
      username,
      name: "Administrador",
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
    });

  if (info.changes > 0) {
    console.log(
      `[seed] Conta criada — usuário: "${username}" senha: "${password}" (troque depois de logar).`
    );
  }
}
