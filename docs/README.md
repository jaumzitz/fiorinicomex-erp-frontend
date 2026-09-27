# Documentação — Netuno ERP (Fiorini Comex)

**Netuno** é o codinome/nome provisório do software; **Fiorini Comex** é a
empresa cliente que vai usá-lo. O nome "Netuno" aparece hoje só na tela de
login — o resto da UI ainda usa a marca da Fiorini, que vem de
`EmpresaConfig`.

Este diretório documenta o estado atual do sistema para orientar quem (pessoa ou
agente) for trabalhar no back-end, no banco de dados, ou em novas telas do
front-end. É complementar ao [`fiorini-comex-contexto.md`](../fiorini-comex-contexto.md)
na raiz do repositório, que é o documento de requisitos original do cliente
(com itens `[A DECIDIR]`/`[A CONFIRMAR]`).

## Como ler

Leia nesta ordem se for a primeira vez no projeto:

1. **[01-dominio-negocio.md](01-dominio-negocio.md)** — o que é a Fiorini Comex, glossário
   do domínio (PI, DI, Numerário, etc.), fluxo de status, papéis de empresa.
2. **[02-frontend.md](02-frontend.md)** — arquitetura do front-end atual (Fase 1):
   stack, estrutura de pastas, gerenciamento de estado, padrões de UI, e
   lacunas conhecidas que o back-end precisa resolver.
3. **[03-modelo-dominio.md](03-modelo-dominio.md)** — as entidades e campos do domínio,
   como estão modeladas hoje em TypeScript (`src/types/domain.ts`), com o
   significado de cada campo.
4. **[04-schema-banco.md](04-schema-banco.md)** — proposta de schema relacional
   (Postgres/RDS) derivada do modelo de domínio, com diagrama ER.

Se você é um agente de IA, comece por [`../CLAUDE.md`](../CLAUDE.md): resume
comandos, convenções e as armadilhas conhecidas do código.

## Estado do projeto (resumo rápido)

*Atualizado em 2026-09-27.*

- **Fase atual**: front-end considerado **pronto por ora** (React 19 + Vite +
  TypeScript + Tailwind v4, PWA instalável), rodando inteiramente sobre
  **dados mockados em memória** (`src/data/mock-data.ts` + React Context).
  Não há back-end, banco de dados real, nem autenticação — tudo isso é o
  próximo passo. Um `F5` descarta qualquer alteração feita na sessão.
- **Hospedagem definida (2026-09-27): AWS** — front-end, **RDS Postgres**
  (banco) e **S3** (storage/anexos), além do Portal do Cliente. A camada de
  API entre o front-end e o RDS e o mecanismo de autenticação **ainda não
  foram decididos** — RDS puro não vem com REST/Auth/RLS-por-JWT prontos
  como o Supabase (avaliado antes, descartado) oferecia.
- **Próximo passo** (o motivo desta pasta existir): decidir a camada de API,
  provisionar o RDS a partir do schema proposto, depois substituir os Context
  providers mockados por chamadas reais a essa API, mantendo os mesmos nomes
  de campo (em português, `camelCase` no front, `snake_case` no banco) para
  minimizar o retrabalho de UI.
- Existe um rascunho de migração SQL em `db/migrations/`, mantido em
  sincronia com o modelo de domínio atual — ver [04-schema-banco.md](04-schema-banco.md).
  Nenhuma instância RDS foi provisionada ainda.
- Telas prontas: Boas-vindas, Processos de Importação (tabela/cards/kanban +
  drawer do PI), Cadastro de Empresas, BI, Administração (incl. usuários e
  preferências de sistema) e Login (casca de UI). Falta o Portal do Cliente,
  que é uma aplicação à parte.
- Repositório: `https://github.com/jaumzitz/fiorinicomex-erp-frontend`,
  branch de trabalho `develop`.

## Rodando o projeto

```bash
npm install
npm run dev     # Vite em http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

Não há framework de testes configurado — a verificação hoje é `tsc` + `oxlint`
+ abrir a tela no navegador.

## Convenções úteis para quem for mexer no back-end

- **Nomenclatura**: todo o domínio é em português (`processos`, `numerario`,
  `comentarios`, `visivelNoPortal`, etc.) — manter essa convenção no banco e na
  API evita uma camada de tradução desnecessária.
- **IDs**: o front-end usa `crypto.randomUUID()` para gerar IDs client-side;
  o banco deve usar `uuid` com `gen_random_uuid()` como default, e o front
  deve parar de gerar IDs assim que a API estiver no ar (passar a usar o ID
  retornado pelo insert).
- **Datas**: armazenadas como string `YYYY-MM-DD` (ver `src/lib/date.ts`),
  exibidas como `dd/mm/aaaa`. No banco devem virar `date` (ou `timestamptz`
  quando o campo também carrega hora, como `criadoEm`/`atualizadoEm`).
- **Enums**: status de PI, status de numerário, modal de transporte, tipo de
  carga e tipo de relacionamento de empresa são todos conjuntos fechados de
  string no front (`as const` arrays) — candidatos naturais a `enum` do
  Postgres, já refletido no schema proposto.
