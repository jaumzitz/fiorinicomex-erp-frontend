# Front-end (Fase 1)

## Stack

- **React 19** + **Vite** + **TypeScript**, **Tailwind CSS v4**.
- Componentes de UI no estilo shadcn/ui, mas **escritos à mão** em
  `src/components/ui/` (não instalados via CLI shadcn — houve um bug de
  `EPERM` do CLI escaneando pastas especiais do Windows/OneDrive, então os
  componentes primitivos foram copiados/adaptados diretamente do padrão
  shadcn, sobre primitivas Radix UI).
- **React Router** para navegação entre telas.
- **React Context + `useState`** para estado da aplicação — não há Redux nem
  outra lib de state management. Cada domínio principal tem seu próprio
  Context Provider (ver "Estado" abaixo).
- Ícones: `lucide-react`.
- Sem framework de testes configurado ainda.

## Estrutura de pastas

```
src/
  assets/
    login-navio.jpg  # imagem de fundo da tela de login
  components/
    ui/            # primitivas estilo shadcn (button, input, select, sheet, dialog, table, ...)
    layout/         # AppLayout, Sidebar, MobileTopBar, PageHeader
    processos/      # tabela/cards/kanban de PIs + configuração de colunas
    empresas/       # tabela/cards/drawer de empresas cadastradas
    ProcessoDrawer.tsx    # o drawer de detalhe do PI — o componente mais complexo do app
    SecaoDrawer.tsx       # seção colapsável reutilizável dentro do drawer
    NumerarioPreview.tsx  # prévia HTML do numerário (documento a ser gerado em PDF no back-end)
    EditableField.tsx     # input com label, usado nos campos do drawer
    StatusBadge.tsx / ModalIcon.tsx  # badges/ícones por enum
  data/
    mock-data.ts    # todos os dados iniciais (seed) — substitui o banco na Fase 1
  hooks/
    use-media-query.ts
  lib/
    date.ts             # formatação de datas
    domain-queries.ts    # consultas derivadas (contagens, próximos embarques, etc.) — candidatas a virar queries SQL/RPC
    utils.ts             # cn() (clsx + tailwind-merge)
  routes/
    Welcome.tsx, ProcessosImportacao.tsx, EmpresasCadastro.tsx, BI.tsx, Admin.tsx, Login.tsx
  store/
    ProcessosContext.tsx           # estado de processos (PIs) + todas as mutações
    EmpresasCadastradasContext.tsx # estado de empresas cadastradas + mutações
    EmpresaConfigContext.tsx       # perfil da própria Fiorini (linha única)
    TributosCatalogoContext.tsx    # catálogo compartilhado de tributos/despesas
    UsuariosContext.tsx            # usuários do sistema (tela /admin/usuarios) — não é sessão/auth
  types/
    domain.ts       # única fonte de verdade do modelo de domínio (ver 03-modelo-dominio.md)
```

## Rotas

| Caminho | Tela | Layout | Descrição |
|---|---|---|---|
| `/` | Welcome | AppLayout | Dashboard com KPIs (processos ativos, numerários pendentes, embarques/chegadas) |
| `/processos` | ProcessosImportacao | AppLayout | Tela principal — tabela/cards/kanban de PIs, drawer de detalhe |
| `/empresas` | EmpresasCadastro | AppLayout | CRUD de empresas (clientes, exportadores, fornecedores, etc.) |
| `/bi` | BI | AppLayout | Indicadores: processos por estágio, por cliente, próximos embarques/chegadas |
| `/admin` | Admin | AppLayout | Hub — cards de navegação para cada seção abaixo |
| `/admin/empresa` | AdminEmpresa | AppLayout | Nome, CNPJ, responsável, telefone, endereço |
| `/admin/pagamento` | AdminPagamento | AppLayout | Razão social e dados bancários exibidos no Numerário |
| `/admin/identidade` | AdminIdentidade | AppLayout | Logo horizontal e ícone do sistema |
| `/admin/tributos` | AdminTributos | AppLayout | Catálogo de tributos/despesas do numerário |
| `/admin/usuarios` | AdminUsuarios | AppLayout | CRUD de usuários (não é gestão de sessão/login) |
| `/login` | Login | nenhum | Tela de acesso (split screen: imagem + formulário). **Casca de UI** — `onSubmit` só faz `preventDefault()`, não há auth nem rota protegida |

`AppLayout` é uma casca fixa: o container raiz tem `h-svh overflow-hidden`, a
sidebar (desktop) e a MobileTopBar ficam fora da área rolável e só o `<main>`
rola (`overflow-y-auto`). Quem criar telas novas não deve assumir que a
página inteira rola — o scroll vive no `<main>`. `/login` fica **fora** do
`AppLayout` (sem menu lateral).

As rotas `/admin/*` são todas **irmãs no `App.tsx`** (não usam `<Outlet/>`
aninhado) — é o mesmo padrão flat das demais rotas do app. A navegação entre
elas é feita pelos cards do hub e por um breadcrumb (`Breadcrumb`, em
`src/components/layout/Breadcrumb.tsx`, renderizado via a prop `breadcrumb`
de `PageHeader`) que sempre volta para `/admin`. Se `/admin` ganhar mais
seções no futuro, siga esse padrão: uma rota irmã + entrada no array
`SECOES_ADMIN` (`src/routes/Admin.tsx`) + breadcrumb de dois níveis — evite
aninhar uma terceira camada de navegação sem necessidade real.

## Estado (Context providers, aninhados em `App.tsx`)

```
EmpresaConfigProvider
  ProcessosProvider
    EmpresasCadastradasProvider
      TributosCatalogoProvider
        UsuariosProvider
          <Routes>
```

Cada provider guarda um array (ou objeto) em memória via `useState`,
inicializado a partir de `src/data/mock-data.ts`, e expõe funções de mutação
que fazem `setState` com um novo array (nunca mutam in-place). **Nada é
persistido** — um F5 na página descarta qualquer alteração feita na sessão.
Isso é o gap que o back-end precisa fechar: cada função de mutação do
Context (`atualizarProcesso`, `adicionarComentario`, `criarEmpresa`, etc.)
deve virar uma chamada de API/Supabase, mantendo a mesma assinatura onde
fizer sentido para minimizar mudança nos componentes de UI.

### Gap conhecido: duas fontes de verdade para `Empresa` (parcialmente resolvido 2026-08-15)

`EmpresasCadastradasContext` mantém seu próprio array de `Empresa[]`, e
`src/lib/domain-queries.ts` (`getEmpresa`, `getCliente`) ainda importa
`empresas` diretamente de `src/data/mock-data.ts` (o array estático
original), não do Context — usado em `colunas.ts`, `ProcessosCards.tsx`,
`Welcome.tsx`, `BI.tsx`, `NumerarioPreview.tsx` (só para o cliente do
config). **`ProcessoDrawer.tsx` foi corrigido para usar
`useEmpresasCadastradas()`** (estado vivo) em vez do import estático — é o
ponto onde isso mais importava, porque é onde o seletor de Exportador cria
empresas novas automaticamente (ver `03-modelo-dominio.md`) e precisa
enxergar essa criação imediatamente na mesma sessão. `NumerarioPreview.tsx`
também foi corrigido para resolver `exportadorId` via o Context, já que é
aberto a partir do mesmo drawer. Os demais consumidores de
`domain-queries.ts` (`colunas.ts`, `ProcessosCards.tsx`, `Welcome.tsx`,
`BI.tsx`) continuam lendo o array estático — uma empresa criada na sessão
pode não aparecer ali até recarregar a página. Isso desaparece por completo
ao migrar para uma única tabela `empresas` no banco, consultada da mesma
forma em toda a app.

## Padrões de UI que valem a pena conhecer

- **`localStorage`** é usado para persistir *preferências de interface* (não
  dados de negócio): colunas visíveis da tabela de PIs
  (`fiorini-comex:colunas-processos`), modo de visualização (tabela/cards/kanban,
  `fiorini-comex:visualizacao-processos`) e largura do drawer do PI
  (`fiorini-comex:largura-drawer-processo`). Esse padrão deve continuar mesmo
  depois do back-end existir — são preferências client-side, não pertencem
  ao banco.
- **Abas do drawer do PI**: Processo, Desembaraço, Financeiro, Digitação de DI
  (placeholder, "em construção"), Anexos, Comentários. Cada aba reseta para o
  estado padrão ao trocar de PI (não fica "lembrando" qual aba/seção estava
  aberta de um PI para outro). A barra de abas rola horizontalmente
  (`overflow-x-auto` + utility `scrollbar-hide` definida em `src/index.css`,
  mais um `onWheel` que converte scroll vertical em horizontal), porque em
  telas estreitas as seis abas não cabem. O `overflow-y-hidden` ao lado **não
  é redundante**: `overflow-x: auto` sozinho faz o `overflow-y` computar para
  `auto`, e o `-mb-px` dos botões (que sobrepõe a borda inferior do
  container) deixa 1px de sobra vertical — o bastante para a faixa arrastar
  na vertical no toque.
- **Drawer do PI redimensionável** (desktop, `min-width: 1024px`): um puxador
  na borda esquerda ajusta a largura entre 420px e 90% da janela, com o valor
  persistido em `localStorage`. Dois detalhes não óbvios na implementação
  (`ProcessoDrawer.tsx`), ambos resolvendo bugs reais:
  - o estado "arrastando" vive num `useRef`, não em `useState` — com estado o
    primeiro `pointermove` podia ler um valor desatualizado e o arraste
    simplesmente não começava;
  - `setPointerCapture`/`releasePointerCapture` estão em `try/catch`, porque
    lançam `InvalidPointerId` quando o ponteiro não está "ativo" e uma
    exceção ali abortaria o início do arraste em silêncio.
- **Escape dentro de um campo não fecha o drawer**: o `SheetContent` recebe
  `onEscapeKeyDown` que dá `preventDefault()` quando o alvo é `input`/
  `textarea`. Sem isso, cancelar a edição do nome de um anexo com Esc fechava
  o drawer inteiro (o Radix escuta Escape em `document`, fase de captura —
  `stopPropagation` no handler do campo não resolve).
- **`EditableField` precisa de `min-w-0`**: os campos são itens de um
  `grid grid-cols-2`, e item de grid tem `min-width: auto` — sem o `min-w-0`
  a célula não encolhe abaixo do conteúdo e os campos se sobrepõem em telas
  estreitas. O `appearance-none` nos campos `type="date"` é pelo mesmo
  motivo: o `input[type=date]` do iOS Safari usa a largura intrínseca do
  controle nativo e ignora o `w-full` (o `pl-8` do ícone de calendário
  agrava). Nenhum dos dois é decoração — removê-los traz a sobreposição de
  volta no iPhone.
- **Combobox reutilizável** (`ComboBoxTexto` dentro de `ProcessoDrawer.tsx`):
  input de texto livre com sugestões filtráveis vindas de uma lista, usado
  tanto para o catálogo de tributos quanto para o campo Exportador. Os dois
  casos resolvem "criar item novo" de formas diferentes: tributos usa a prop
  `permitirNovo` + `aoCriarNovo` do próprio componente (mostra um item
  "Adicionar 'X'" explícito no dropdown); Exportador não usa `permitirNovo` —
  em vez disso, o `onChange` passado pelo pai (`selecionarExportador`) faz a
  resolução: procura uma `Empresa` existente com `tiposRelacionamento`
  incluindo `exportador` e mesmo `nomeFantasia` (case-insensitive) e, se não
  achar, chama `criarEmpresa(...)` automaticamente antes de gravar
  `exportadorId` no PI (resolvido 2026-08-15).
- **Soft delete via `ativo`**: o catálogo de tributos, comentários, contatos
  de empresa e empresas nunca são excluídos de verdade, só alternam
  `ativo: true/false` — os itens somem das sugestões/listagens padrão mas
  ficam preservados para não quebrar referências existentes (numerários que
  citam um tributo do catálogo, PIs que apontam para uma empresa inativada,
  etc.). Esse é o padrão a replicar no banco (coluna `ativo`, sem `DELETE`).
  **Exceções, que são exclusão real**: produtos e anexos de um PI, e os itens
  de tributo de um numerário — nada aponta para eles. Exclusões destrutivas
  com consequência (numerário inteiro, anexo) passam por um `Dialog` de
  confirmação com botão `variant="destructive"`; remover uma linha de produto
  ou de tributo é direto, sem confirmação.
- **Números de PI**: gerados client-side como `PI-{maior número atual + 1}`
  (`proximoNumero()` em `ProcessosContext.tsx`). Em produção com múltiplas
  escritas concorrentes isso precisa virar uma sequence/lock no banco para
  evitar colisão — hoje funciona porque só existe uma sessão de um usuário
  por vez.
- **IDs client-side**: `crypto.randomUUID()` é usado para gerar IDs de tudo
  que é criado na sessão (comentários, anexos, PIs, empresas, contatos). Ao
  ligar no banco, o ideal é deixar o Postgres gerar o `uuid` (`gen_random_uuid()`)
  e o front usar o ID retornado pelo insert, não mais gerar client-side.

## O que falta para a Fase 2 (back-end)

1. Provisionar Supabase (auth, storage, Postgres) — ver [04-schema-banco.md](04-schema-banco.md).
2. Trocar os quatro Context providers de `useState` para buscar/gravar via
   Supabase client (ou uma camada de API própria), mantendo os nomes de
   campo em português já usados no front.
3. Resolver o gap de "duas fontes de verdade para Empresa" citado acima —
   deve resolver-se sozinho ao consultar a mesma tabela `empresas` em toda a
   aplicação.
4. Implementar upload real de anexos (Supabase Storage) — hoje é só uma
   `URL.createObjectURL()` local, que não sobrevive a um reload. A UI de
   anexos já está completa (miniatura, renomear, baixar, excluir com
   confirmação, visibilidade no portal); falta só o armazenamento de verdade,
   e a exclusão precisa passar a remover o objeto no bucket.
5. Geração do Numerário em PDF (hoje só existe a prévia em HTML/tela).
6. Autenticação de verdade. A tela `/login` existe visualmente, mas não há
   sessão, rota protegida nem `AuthContext` — o app continua uma SPA
   totalmente aberta. Ao implementar: criar o contexto de sessão, proteger as
   rotas do `AppLayout`, substituir a constante `USUARIO_LOGADO` em
   `Sidebar.tsx` pelo usuário real e fazer o botão de logout encerrar a
   sessão (hoje ele só navega para `/login`).
7. Portal do cliente (tela nova, fora do escopo deste front-end interno).
