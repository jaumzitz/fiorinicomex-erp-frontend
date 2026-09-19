# Netuno ERP — front-end

ERP de **processos de importação** para a Fiorini Comex, uma despachante
aduaneira operada por uma pessoa só. "Netuno" é o codinome/nome provisório do
software; "Fiorini Comex" é a empresa cliente.

A unidade central do sistema é o **PI (Processo de Importação)**, que percorre
os estágios `Aberto → Contratação de Frete → Em Trânsito → Desembaraço →
Carregamento → Encerramento`.

## Estado atual

**Fase 1 — front-end sobre dados mockados.** Todo o estado vive em React
Context inicializado a partir de `src/data/mock-data.ts`; não existe back-end,
banco nem autenticação, e um reload descarta as alterações da sessão.

A Fase 2 (Supabase: Postgres + Auth + Storage) é o próximo passo e já tem
documentação preparatória em [`docs/`](docs/).

## Rodando

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

Não há testes automatizados. A verificação padrão é `npm run build` (ou
`npx tsc -b --noEmit`), `npm run lint` e abrir a tela no navegador.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · Radix UI
(primitivas no estilo shadcn/ui, escritas à mão em `src/components/ui/`) ·
lucide-react.

## Documentação

Leia nesta ordem se for a primeira vez no projeto:

| Documento | Conteúdo |
|---|---|
| [`docs/README.md`](docs/README.md) | Índice, estado do projeto e convenções |
| [`docs/01-dominio-negocio.md`](docs/01-dominio-negocio.md) | Glossário de comércio exterior, fluxo do PI, numerário |
| [`docs/02-frontend.md`](docs/02-frontend.md) | Arquitetura do front-end, rotas, padrões de UI, lacunas |
| [`docs/03-modelo-dominio.md`](docs/03-modelo-dominio.md) | Entidades e campos (espelha `src/types/domain.ts`) |
| [`docs/04-schema-banco.md`](docs/04-schema-banco.md) | Schema relacional proposto + diagrama ER |
| [`fiorini-comex-contexto.md`](fiorini-comex-contexto.md) | Requisitos originais do cliente, com itens em aberto |

Para agentes de IA: [`CLAUDE.md`](CLAUDE.md) resume as convenções e as
armadilhas conhecidas do código.
