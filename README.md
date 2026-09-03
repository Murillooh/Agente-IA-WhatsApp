# MeetCloser

Site/app de automação de prospecção com o objetivo geral de **fechar reuniões**.

## Os dois modos

- **Modo 1** — puxa leads e prospecta via WhatsApp e Instagram com um script de vendas, até agendar a reunião. Cada lead tem uma timeline ("esboço") de tudo que aconteceu até o fechamento da data.
- **Modo 2** — igual ao Modo 1, mas também faz ligações (com IA de voz) para o lead, e traz o mesmo esboço da conversa até agendar a reunião. O sistema consegue disparar **várias ligações ao mesmo tempo** para leads diferentes (veja "Disparo em lote" abaixo).

## O que já está pronto

- Cadastro e importação em massa (CSV) de leads, com Modo 1 ou Modo 2.
- Scripts de vendas editáveis por modo/canal (WhatsApp, Instagram, Ligação).
- Botão "Rodar automação" em cada lead — dispara o script pelos canais certos do modo escolhido.
- Disparo em lote: selecione vários leads na lista e rode a automação para todos ao mesmo tempo (útil para o Modo 2 ligar para várias pessoas em paralelo).
- Timeline/esboço de cada lead com todas as mensagens e ligações, até o fechamento.
- Agendamento e status de reuniões (agendada / realizada / cancelada).
- Dashboard com funil de status e próximas reuniões.
- Tela de Integrações mostrando o que está e o que não está conectado ainda.

## O que falta plugar: as APIs reais

Hoje o app roda em **modo simulado**: nenhuma mensagem ou ligação real é enviada, mas todo o fluxo (timeline, status, agendamento) já funciona de ponta a ponta com dados fictícios gerados na hora.

Quando você pesquisar e decidir os provedores, é só:

1. Copiar `.env.example` para `.env` e preencher as chaves.
2. Implementar a chamada real dentro de UM destes arquivos (o resto do app não precisa mudar):
   - `src/lib/integrations/whatsapp.ts` — ex: Meta Cloud API, Twilio WhatsApp, Z-API
   - `src/lib/integrations/instagram.ts` — ex: Instagram Graph API (Meta)
   - `src/lib/integrations/voice.ts` — ex: Vapi, Bland AI, Retell AI, Twilio + LLM

Cada uma dessas funções já tem a assinatura pronta (o que entra e o que sai) e comentários com um exemplo de chamada real, então normalmente basta trocar o "corpo simulado" pela chamada HTTP de verdade.

Se o provedor de voz que você escolher funcionar por webhook (a maioria funciona — você inicia a ligação e recebe o resultado depois), crie uma rota nova em `src/app/api/webhooks/voice/route.ts` que recebe o callback e chama `addEvent(...)` / `updateLeadStatus(...)` (em `src/lib/repo/`) para atualizar o lead quando a ligação terminar.

## Como rodar localmente

Pré-requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Na primeira execução, o banco de dados local (SQLite, em `data/app.db`) é criado automaticamente com alguns leads de exemplo.

## Como colocar no ar (Vercel)

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel (vercel.com/new).
3. Configure as variáveis de ambiente de `.env.example` quando tiver as APIs escolhidas (pode publicar sem elas — o app continua funcionando em modo simulado).
4. Deploy.

> Observação: o banco usado aqui é SQLite em arquivo local, ótimo para começar e para uso com poucos usuários simultâneos. Se o volume de leads/chamadas crescer bastante, é só trocar as funções em `src/lib/repo/*.ts` por um banco gerenciado (ex: Postgres/Neon/Turso) — a interface dessas funções pode continuar igual, então o resto do app não precisa mudar.

## Estrutura do projeto

```
src/
  app/                     # páginas (dashboard, leads, reuniões, scripts, integrações) e rotas de API
  components/               # componentes de UI reutilizáveis
  lib/
    db.ts                  # conexão SQLite + criação de tabelas + dados de exemplo
    types.ts               # tipos compartilhados
    automation.ts          # orquestra o disparo de um lead (ou vários em paralelo)
    repo/                  # acesso a dados (leads, eventos, reuniões, scripts)
    integrations/          # PONTO DE ENTRADA DAS APIS REAIS (whatsapp, instagram, voice)
```
