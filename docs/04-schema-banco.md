# Schema do banco de dados

Proposta de schema relacional (Postgres, hospedado em **Aurora Serverless v2
na AWS** — atualizado 2026-09-27, era Supabase até então; ver
[05-implantacao-aws.md](05-implantacao-aws.md) para a arquitetura completa),
derivada do modelo de domínio em [03-modelo-dominio.md](03-modelo-dominio.md).
Convenção: tabelas e colunas em `snake_case`, em português, espelhando os
nomes já usados no front-end (só troca de `camelCase` para `snake_case`).

O SQL executável correspondente está em
[`db/migrations/20260808000000_initial_schema.sql`](../db/migrations/20260808000000_initial_schema.sql).
Como o projeto ainda não tem nenhum RDS provisionado, essa migração é editada
diretamente para acompanhar o modelo de domínio (não há histórico de
migração "real" para preservar ainda) — isso deve mudar assim que houver uma
instância rodando: dali em diante, mudanças de schema devem virar novas
migrações incrementais, nunca editar uma já aplicada.

## Decisões de modelagem

- **`empresas` unificada**: clientes, exportadores, fornecedores de frete,
  agentes de carga, transportadores e recintos são todos a mesma tabela,
  diferenciados por uma tabela associativa `empresa_relacionamentos`
  (N:N com um enum de papel) — porque uma empresa pode acumular papéis
  (ex.: cliente e exportador ao mesmo tempo).
- **`numerarios` como tabela própria, 1:1 opcional com `processos`**: nem
  todo PI tem numerário, e quando tem, é só um.
- **`numerario_tributos` guarda um snapshot de texto (`descricao`)**, não só
  uma FK para o catálogo — porque o catálogo pode ter itens renomeados ou
  inativados depois, e isso não deve alterar retroativamente um numerário já
  enviado ao cliente. Ainda assim, guarda uma FK opcional
  `tributo_catalogo_id` para permitir relatórios agregados por tipo de
  tributo sem depender de match textual.
- **`tributos_catalogo` é soft-delete via `ativo`**, nunca `DELETE` — mesmo
  padrão do front-end, para não quebrar a FK opcional citada acima.
- **`empresas`, `contatos_empresa` e `comentarios` também são soft-delete via
  `ativo`** (resolvido 2026-08-15) — "inativar" um registro some das
  sugestões/listagens padrão mas preserva o histórico e não quebra FKs
  (ex.: um PI antigo continua apontando para uma empresa inativada).
  **`processo_produtos` e `anexos` são a exceção**: são `DELETE` de verdade,
  porque não são referenciados por nenhuma outra tabela. No caso de `anexos`,
  o `DELETE` precisa ser acompanhado da remoção do objeto no Storage.
- **`processo_produtos` tem `nome` + `quantidade`** (antes era só uma coluna
  `produto` de texto) — acompanhando a mudança do front-end de
  `produtos: string[]` para `Produto[]` em 2026-09-18.
- **`usuarios` também é soft-delete via `ativo`** (2026-09-24) — "inativar"
  revoga o acesso sem apagar o registro. Tinha ficado de fora da migração
  quando o campo foi adicionado no front-end; corrigido junto com a tela de
  gestão de usuários.
- **`tributos_catalogo.padrao`** (2026-09-24) — quais itens entram
  automaticamente em todo numerário novo. Antes era uma lista hardcoded no
  front-end (`TRIBUTOS_CATALOGO_PADRAO`, os mesmos 6 itens do seed); agora é
  um campo editável por item (tela `/admin/tributos`), então a
  aplicação/API deve gerar `numerario_tributos` de um numerário novo
  consultando `tributos_catalogo where padrao and ativo`, não uma lista
  fixa no código.
- **`preferencias_sistema` é singleton, separada de `empresa_config`**
  (2026-09-24) — mesmo padrão de linha única (índice único parcial), mas
  conceitualmente distinta: não é dado institucional da empresa, é
  comportamento do front-end (hoje só o separador de exibição do número do
  PI). `processos.numero` continua sempre `PI-{sequência}` no banco; o
  separador é só uma transformação de exibição, nunca deve ser aplicado ao
  dado armazenado nem à geração do próximo número.
- **`portal_usuarios` (nova, 2026-09-27)** — mapeia uma conta Cognito do
  portal do cliente (`cognito_sub`) para uma `Empresa` (`empresa_id`), N:1
  (uma empresa pode ter múltiplas contas — decidido junto com a arquitetura
  AWS, ver [05-implantacao-aws.md](05-implantacao-aws.md)). Sem
  contrapartida em `domain.ts`: é infraestrutura de auth, não modelo de
  negócio.
- **Enums do Postgres** para todo conjunto fechado de valores (`pi_status`,
  `pi_modal`, `pi_tipo_carga`, `tipo_relacionamento_empresa`,
  `numerario_status`, `separador_numero_pi`) — mapeiam 1:1 para os
  `as const` arrays do TypeScript.
- **`exportador_id` é FK opcional para `empresas`** (resolvido 2026-08-15) —
  ver a nota em [03-modelo-dominio.md](03-modelo-dominio.md) sobre como o
  front-end resolve isso sem exigir cadastro prévio (cria a empresa
  automaticamente quando o nome digitado não corresponde a nenhuma
  sugestão).
- **RLS (Row Level Security)** ainda não está no schema — a Fase 1 do
  front-end não tem autenticação, então não há ainda um "usuário logado"
  para uma policy referenciar. Camada de API e modelo de auth já foram
  decididos (2026-09-27, ver [05-implantacao-aws.md](05-implantacao-aws.md)):
  Lambda + API Gateway, com Cognito (dois User Pools) + link assinado por PI.
  RLS "de verdade" no Postgres continua em aberto como possível camada extra
  — a filtragem primária deve acontecer no código da API (Lambda), que já
  recebe as claims do chamador via authorizer.

## Diagrama ER

```mermaid
erDiagram
    EMPRESAS {
        uuid id PK
        text nome_fantasia
        text razao_social
        boolean estrangeira
        text cnpj
        text tax_id
        text pais
        text site
        text telefone
        text email
        boolean ativo
        timestamptz criado_em
        timestamptz atualizado_em
    }

    EMPRESA_RELACIONAMENTOS {
        uuid empresa_id PK_FK
        enum tipo PK
    }

    CONTATOS_EMPRESA {
        uuid id PK
        uuid empresa_id FK
        text nome
        text telefone
        text email
        boolean ativo
    }

    EMPRESA_CONFIG {
        uuid id PK
        text nome
        text razao_social
        text cnpj
        text responsavel
        text endereco
        text email
        text telefone
        text banco
        text agencia
        text conta
        text pix
        text logo_horizontal_url
        text icone_url
        timestamptz atualizado_em
    }

    USUARIOS {
        uuid id PK
        text nome
        text email
        text cargo
        timestamptz criado_em
        boolean ativo
    }

    PORTAL_USUARIOS {
        uuid id PK
        uuid empresa_id FK
        text cognito_sub UK
        text email
        boolean ativo
        timestamptz criado_em
    }

    PREFERENCIAS_SISTEMA {
        uuid id PK
        enum separador_numero_pi
    }

    PROCESSOS {
        uuid id PK
        text numero UK
        uuid cliente_id FK
        enum status
        enum modal
        uuid fornecedor_frete_id FK
        uuid exportador_id FK
        text referencia_cliente
        boolean licenca_importacao
        enum tipo_carga
        text navio
        text origem
        text destino
        date previsao_embarque
        date previsao_chegada
        text hbl_hawb
        text conhecimento_embarque
        date data_liberacao_mapa
        date data_chegada
        date data_presenca_carga
        date numerario_enviado_em
        date numerario_pago_em
        text numero_di
        date data_ci
        date data_siscargo
        date data_icms
        date data_encerramento
        timestamptz criado_em
        timestamptz atualizado_em
    }

    PROCESSO_FORNECEDORES_COTADOS {
        uuid processo_id PK_FK
        uuid empresa_id PK_FK
    }

    PROCESSO_PRODUTOS {
        uuid id PK
        uuid processo_id FK
        text nome
        numeric quantidade
    }

    NUMERARIOS {
        uuid id PK
        uuid processo_id FK_UK
        text invoice
        numeric cotacao_moeda
        enum status
    }

    TRIBUTOS_CATALOGO {
        uuid id PK
        text nome UK
        boolean ativo
        boolean padrao
    }

    NUMERARIO_TRIBUTOS {
        uuid id PK
        uuid numerario_id FK
        uuid tributo_catalogo_id FK
        text descricao
        numeric valor
    }

    COMENTARIOS {
        uuid id PK
        uuid processo_id FK
        text autor
        text texto
        timestamptz criado_em
        boolean visivel_no_portal
        enum estagio
        boolean ativo
    }

    ANEXOS {
        uuid id PK
        uuid processo_id FK
        text nome_arquivo
        bigint tamanho_bytes
        timestamptz enviado_em
        boolean visivel_no_portal
        text storage_path
    }

    EMPRESAS ||--o{ EMPRESA_RELACIONAMENTOS : "possui papel"
    EMPRESAS ||--o{ CONTATOS_EMPRESA : "possui"
    EMPRESAS ||--o{ PORTAL_USUARIOS : "tem contas de portal"
    EMPRESAS ||--o{ PROCESSOS : "e cliente em (cliente_id)"
    EMPRESAS ||--o{ PROCESSOS : "e fornecedor aceito em (fornecedor_frete_id)"
    EMPRESAS ||--o{ PROCESSOS : "e exportador em (exportador_id)"
    EMPRESAS ||--o{ PROCESSO_FORNECEDORES_COTADOS : "e cotado em"
    PROCESSOS ||--o{ PROCESSO_FORNECEDORES_COTADOS : "convida"
    PROCESSOS ||--o{ PROCESSO_PRODUTOS : "contem"
    PROCESSOS ||--o| NUMERARIOS : "possui"
    PROCESSOS ||--o{ COMENTARIOS : "possui"
    PROCESSOS ||--o{ ANEXOS : "possui"
    NUMERARIOS ||--o{ NUMERARIO_TRIBUTOS : "possui"
    TRIBUTOS_CATALOGO ||--o{ NUMERARIO_TRIBUTOS : "sugere descricao para"
```

> `USUARIOS.id` **não** referencia mais `auth.users` (isso era Supabase Auth;
> o provedor agora é Cognito — ver [05-implantacao-aws.md](05-implantacao-aws.md)).
> A migração ainda não foi atualizada para mapear `usuarios` a um
> `cognito_sub` do User Pool interno, ao contrário de `PORTAL_USUARIOS`, que
> já nasce com essa coluna (User Pool separado, do portal do cliente).
> `EMPRESA_CONFIG` e `PREFERENCIAS_SISTEMA` são tabelas singleton (uma única
> linha, reforçada por índice único parcial) — não se relacionam com mais
> nada.

## Mapeamento tipo TypeScript → tabela

| Tipo em `domain.ts` | Tabela(s) |
|---|---|
| `Empresa` | `empresas` + `empresa_relacionamentos` + `contatos_empresa` |
| `EmpresaConfig` | `empresa_config` (singleton) |
| `PreferenciasSistema` | `preferencias_sistema` (singleton) |
| `Usuario` | `usuarios` |
| `ProcessoImportacao` | `processos` + `processo_fornecedores_cotados` |
| `Produto` | `processo_produtos` |
| `Numerario` | `numerarios` |
| `ItemTributo` | `numerario_tributos` |
| `TributoCatalogo` | `tributos_catalogo` |
| `Comentario` | `comentarios` |
| `Anexo` | `anexos` |

`portal_usuarios` não tem uma linha aqui porque não é um tipo de domínio de
negócio — é uma tabela de infraestrutura de auth (mapeia uma conta Cognito do
portal do cliente para uma `Empresa`), então não tem contrapartida em
`domain.ts`.

## O que ainda falta decidir antes de provisionar

0. ~~Camada de API entre o front-end e o RDS~~ → **[DECIDIDO 2026-09-27]**
   Lambda + API Gateway, banco Aurora Serverless v2 (variante do RDS) via
   Data API. Ver [05-implantacao-aws.md](05-implantacao-aws.md).
1. ~~RLS e modelo de auth~~ → **[DECIDIDO 2026-09-27]** 2 usuários internos
   (Cognito User Pool próprio) + portal do cliente com conta (e-mail+senha,
   múltiplas contas por empresa, Cognito User Pool separado) e/ou link
   assinado por PI (sem conta). CNPJ como credencial foi descartado. A
   tabela `portal_usuarios` já está na migração. Existe uma tela de login
   (`/login`) desenhada, mas ainda sem nenhuma lógica por trás — isso é
   implementação, não decisão de arquitetura.
2. **Unidade de medida de `processo_produtos.quantidade`** — hoje é um número
   solto (kg? peças? m³?). Se virar enum/tabela de unidades, é uma coluna
   nova aqui.
3. **Onde entra `canal de parametrização`** (verde/amarelo/vermelho da
   Receita Federal) — citado no domínio de negócio mas ainda sem campo no
   front-end nem no schema.
4. **Confirmar semântica de `data_ci` e `data_siscargo`** antes de considerar
   esses nomes definitivos (ver [01-dominio-negocio.md](01-dominio-negocio.md)).
5. **Layout de keys no bucket S3** para `anexos.storage_path` e as duas
   imagens de `empresa_config` (logo/ícone) — convenção de path ainda não
   definida.
6. **Geração do número do PI** (`processos.numero`) — hoje o front calcula
   `PI-{maior + 1}` client-side; no banco precisa virar sequence ou função
   com lock para não colidir.
