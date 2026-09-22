# Schema do banco de dados

Proposta de schema relacional (Postgres via Supabase), derivada do modelo de
domínio em [03-modelo-dominio.md](03-modelo-dominio.md). Convenção: tabelas e
colunas em `snake_case`, em português, espelhando os nomes já usados no
front-end (só troca de `camelCase` para `snake_case`).

O SQL executável correspondente está em
[`supabase/migrations/20260808000000_initial_schema.sql`](../supabase/migrations/20260808000000_initial_schema.sql).
Como o projeto ainda não tem nenhum ambiente Supabase provisionado, essa
migração é editada diretamente para acompanhar o modelo de domínio (não há
histórico de migração "real" para preservar ainda) — isso deve mudar assim
que houver um projeto Supabase de verdade rodando: dali em diante, mudanças
de schema devem virar novas migrações incrementais, nunca editar uma já
aplicada.

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
- **Enums do Postgres** para todo conjunto fechado de valores (`pi_status`,
  `pi_modal`, `pi_tipo_carga`, `tipo_relacionamento_empresa`,
  `numerario_status`) — mapeiam 1:1 para os `as const` arrays do TypeScript.
- **`exportador_id` é FK opcional para `empresas`** (resolvido 2026-08-15) —
  ver a nota em [03-modelo-dominio.md](03-modelo-dominio.md) sobre como o
  front-end resolve isso sem exigir cadastro prévio (cria a empresa
  automaticamente quando o nome digitado não corresponde a nenhuma
  sugestão).
- **RLS (Row Level Security)** ainda não está no schema — a Fase 1 do
  front-end não tem autenticação, então não há ainda um "usuário logado"
  para uma policy referenciar. Precisa ser desenhado junto com a decisão de
  auth (usuário único administrativo vs. múltiplos usuários vs. portal do
  cliente com acesso restrito por `processo_id`).

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
        uuid id PK_FK
        text nome
        text email
        text cargo
        timestamptz criado_em
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

> `USUARIOS.id` referencia `auth.users(id)` do Supabase Auth (fora deste
> diagrama). `EMPRESA_CONFIG` é uma tabela singleton (uma única linha,
> reforçada por índice único parcial) — não se relaciona com mais nada.

## Mapeamento tipo TypeScript → tabela

| Tipo em `domain.ts` | Tabela(s) |
|---|---|
| `Empresa` | `empresas` + `empresa_relacionamentos` + `contatos_empresa` |
| `EmpresaConfig` | `empresa_config` (singleton) |
| `Usuario` | `usuarios` |
| `ProcessoImportacao` | `processos` + `processo_fornecedores_cotados` |
| `Produto` | `processo_produtos` |
| `Numerario` | `numerarios` |
| `ItemTributo` | `numerario_tributos` |
| `TributoCatalogo` | `tributos_catalogo` |
| `Comentario` | `comentarios` |
| `Anexo` | `anexos` |

## O que ainda falta decidir antes de provisionar

1. **RLS e modelo de auth** — usuário único administrativo (mais simples) vs.
   múltiplos usuários (a tabela `usuarios` já existe, mas nenhuma tela a
   alimenta) vs. acesso do portal do cliente (precisa de policy própria,
   provavelmente via token assinado, não via `auth.users`). Existe uma tela
   de login (`/login`) desenhada, mas sem nenhuma lógica por trás.
2. **Unidade de medida de `processo_produtos.quantidade`** — hoje é um número
   solto (kg? peças? m³?). Se virar enum/tabela de unidades, é uma coluna
   nova aqui.
3. **Onde entra `canal de parametrização`** (verde/amarelo/vermelho da
   Receita Federal) — citado no domínio de negócio mas ainda sem campo no
   front-end nem no schema.
4. **Confirmar semântica de `data_ci` e `data_siscargo`** antes de considerar
   esses nomes definitivos (ver [01-dominio-negocio.md](01-dominio-negocio.md)).
5. **Storage bucket layout** para `anexos.storage_path` e as duas imagens de
   `empresa_config` (logo/ícone) — convenção de path ainda não definida.
6. **Geração do número do PI** (`processos.numero`) — hoje o front calcula
   `PI-{maior + 1}` client-side; no banco precisa virar sequence ou função
   com lock para não colidir.
