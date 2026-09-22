# CLAUDE.md

Orientações para agentes trabalhando neste repositório.

## O que é

**Netuno ERP** (codinome provisório do software) — front-end de um ERP de
processos de importação para a **Fiorini Comex**, despachante aduaneira
operada por uma pessoa só. Entidade central: o **PI (Processo de
Importação)**.

**Fase 1: front-end sobre dados mockados.** Não existe back-end, banco nem
autenticação. Todo o estado vive em React Context inicializado por
`src/data/mock-data.ts`, e um reload descarta as alterações. A Fase 2
(Supabase) ainda não começou.

## Comandos

```bash
npm run dev                # Vite em http://localhost:5173
npx tsc -b --noEmit        # type-check (mais rápido que o build)
npm run lint               # oxlint
npm run build              # tsc -b && vite build
```

Não há testes automatizados. Verificação padrão: type-check + lint + abrir a
tela no navegador.

## Documentação

`docs/` é a fonte de verdade sobre domínio e arquitetura — leia antes de
mexer em modelo de dados ou criar telas:

- `docs/01-dominio-negocio.md` — glossário (PI, DI, DUIMP, numerário, LPCO...) e fluxos
- `docs/02-frontend.md` — arquitetura, rotas, padrões de UI, lacunas conhecidas
- `docs/03-modelo-dominio.md` — entidades e campos, espelhando `src/types/domain.ts`
- `docs/04-schema-banco.md` — schema Postgres proposto (+ `supabase/migrations/`)
- `fiorini-comex-contexto.md` — requisitos originais do cliente

**Mantenha esses documentos em dia.** Mudou o modelo de domínio? Atualize
`03`, `04` e a migração SQL na mesma leva.

## Convenções

- **Domínio em português**: tipos, campos, funções e variáveis de negócio são
  em português (`processos`, `numerario`, `visivelNoPortal`, `atualizarProcesso`).
  `camelCase` no front, `snake_case` no banco. Não traduza para inglês.
- `src/types/domain.ts` é a **única fonte de verdade** do modelo. Enums são
  arrays `as const` + um `Record` de labels ao lado.
- Datas são strings `YYYY-MM-DD` (`src/lib/date.ts`), exibidas como `dd/mm/aaaa`.
- Estilo: Tailwind v4 com utilities; use `cn()` (`src/lib/utils.ts`) para
  compor classes condicionais. Primitivas de UI em `src/components/ui/` são
  shadcn/ui escritas à mão — **não rode o CLI do shadcn** (dá `EPERM` no
  Windows/OneDrive); copie e adapte o componente à mão.
- Breakpoint de "desktop" no projeto é **1024px** (`lg`), inclusive no hook
  `useMediaQuery('(min-width: 1024px)')`. Abaixo disso, layout mobile.
- Preferências de interface (colunas visíveis, modo de visualização, largura
  do drawer) vão para `localStorage` com prefixo `fiorini-comex:`. Dados de
  negócio **nunca** vão para `localStorage`.
- **Soft delete via `ativo`** é o padrão para empresas, contatos, comentários
  e catálogo de tributos. Exceções (exclusão real): produtos, anexos e itens
  de tributo. Exclusões destrutivas com consequência passam por `Dialog` de
  confirmação com botão `variant="destructive"`.
- Português do Brasil em toda a UI e nas mensagens ao usuário.

## Armadilhas conhecidas

- **O `<main>` é quem rola**, não a página: `AppLayout` é uma casca
  `h-svh overflow-hidden` com a sidebar fora da área rolável. Não assuma
  scroll de documento ao criar telas.
- **`domain-queries.ts` lê o array estático de `mock-data.ts`**, não o
  Context — uma empresa criada na sessão pode não aparecer em telas que usam
  `getEmpresa`/`getCliente` (`colunas.ts`, `ProcessosCards.tsx`,
  `Welcome.tsx`, `BI.tsx`). É o gap de "duas fontes de verdade"; some quando
  houver banco.
- **Radix escuta Escape em `document`, fase de captura**: `stopPropagation`
  num campo aninhado não impede o Sheet/Dialog de fechar. Use
  `onEscapeKeyDown` + `preventDefault()` no `SheetContent`/`DialogContent`
  (já feito no drawer do PI).
- **Arraste com Pointer Events**: guarde o "está arrastando" em `useRef`, não
  em `useState` (o primeiro `pointermove` pode ler estado velho), e envolva
  `setPointerCapture`/`releasePointerCapture` em `try/catch` — eles lançam
  `InvalidPointerId` e a exceção aborta o arraste em silêncio.
- **IDs e número do PI são gerados no client** (`crypto.randomUUID()`,
  `PI-{maior + 1}`). Ao ligar o banco, passe a usar o que o insert retorna.

## Fora de escopo por enquanto

Autenticação real (a tela `/login` é casca de UI, sem sessão nem rota
protegida), upload real de anexos, geração do numerário em PDF, envio de
e-mail e o portal do cliente. Todos estão detalhados como pendências em
`docs/02-frontend.md`.
