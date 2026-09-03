# Prompt para colar no Claude Code (aba de código)

Copie o texto do bloco abaixo (a partir de "Contexto do projeto") e cole na aba do Claude Code, **dentro da pasta do projeto** (depois de descompactar o zip e rodar `npm install`). Ele vai continuar o desenvolvimento a partir do que já existe, e você acompanha e ajusta cada mudança em tempo real.

---

## Contexto do projeto

Este é o **MeetCloser**, um app Next.js (App Router, TypeScript, Tailwind v4, banco SQLite via `better-sqlite3`) de automação de prospecção cujo objetivo geral é **fechar reuniões**. Já está funcionando (build limpo, testado ponta a ponta) com:

- **Modo 1**: puxa/importa leads e prospecta por WhatsApp e Instagram com script de vendas, até agendar a reunião, com uma timeline ("esboço") de tudo que aconteceu.
- **Modo 2**: igual ao Modo 1, mas também dispara ligação com IA de voz — inclusive várias ligações em paralelo (disparo em lote), respeitando um limite de concorrência.
- Cadastro manual e importação em massa de leads via CSV.
- Editor de scripts de vendas por Modo + Canal.
- Agendamento e status de reuniões (agendada / realizada / cancelada).
- Dashboard com funil de status e próximas reuniões.
- Tela de Integrações mostrando o que está e o que não está conectado.

As APIs reais (WhatsApp, Instagram, IA de voz) **ainda não foram escolhidas** — hoje tudo roda em modo simulado. Os pontos de plugue já estão isolados em:

- `src/lib/integrations/whatsapp.ts`
- `src/lib/integrations/instagram.ts`
- `src/lib/integrations/voice.ts`
- `src/lib/automation.ts` (orquestra o disparo por lead e em lote)

Leia o `README.md` na raiz do projeto antes de começar — ele tem a estrutura completa de pastas e onde cada coisa fica.

## Como eu quero trabalhar com você

1. **Antes de tudo**: rode `git init` (se ainda não houver repositório) e faça um commit inicial com o estado atual do projeto, para eu conseguir ver o diff de cada mudança que você fizer daqui pra frente.
2. Trabalhe em **passos pequenos e revisáveis**: uma funcionalidade ou correção por vez, não várias misturadas no mesmo commit/alteração.
3. Antes de qualquer mudança **estrutural ou de arquitetura** (trocar o banco de dados, adicionar autenticação, mudar a stack, adicionar uma lib pesada), **me pergunte primeiro** e explique o motivo — não decida sozinho.
4. Depois de cada mudança relevante, rode `npm run lint` e `npm run build` para garantir que nada quebrou, e me avise se algo falhar.
5. Sempre que possível, rode o app (`npm run dev`) e descreva rapidamente o que mudou na prática (ex: "agora a tela de leads tem busca por nome"), para eu conseguir conferir no navegador.
6. Se eu pedir algo ambíguo, pergunte antes de implementar em vez de assumir.

## O que eu quero que você faça agora

*(Descreva aqui a próxima funcionalidade, ajuste ou correção que você quer. Alguns exemplos de coisas que ainda fazem sentido evoluir neste projeto, só como referência — apague o que não for usar:)*

- Adicionar autenticação simples (login com senha ou magic link) antes de colocar no ar.
- Adicionar busca e filtros na lista de leads (por status, por modo, por nome).
- Permitir editar os dados de um lead já existente (hoje só dá pra criar e mudar status).
- Quando eu escolher os provedores de WhatsApp/Instagram/voz, implementar a chamada real nos três arquivos de integração e criar a rota de webhook para receber o resultado das ligações assíncronas.
- Preparar o deploy na Vercel (variáveis de ambiente, configuração de produção).

---

**Dica**: depois desse primeiro prompt, para pedir a próxima coisa é só continuar a conversa normalmente na mesma aba do Claude Code — ele já vai ter o contexto do projeto e do jeito que você quer trabalhar.
