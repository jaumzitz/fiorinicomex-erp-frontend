-- Fiorini Comex ERP — schema inicial
-- Convenção: nomes de tabela/coluna em snake_case, em português, espelhando o
-- domínio já validado no front-end (Fase 1, dados mockados).

create extension if not exists "pgcrypto";

-- Função utilitária reaproveitada pelas triggers de atualizado_em abaixo.
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- Empresas (tabela unificada: clientes, exportadores, agentes de
-- carga, transportadores, recintos, fornecedores de frete, etc.)
-- ============================================================

create type tipo_relacionamento_empresa as enum (
  'cliente',
  'exportador',
  'fornecedor_frete',
  'agente_carga',
  'transportador',
  'recinto'
);

create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null,
  razao_social text not null,
  -- Empresa brasileira (cnpj) ou estrangeira (tax_id + pais).
  estrangeira boolean not null default false,
  cnpj text,
  tax_id text,
  pais text,
  site text,
  telefone text,
  email text,
  -- Soft delete — nunca DELETE, para não quebrar FKs de processos/numerarios
  -- que já referenciam a empresa.
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint empresas_identificacao_check check (
    (estrangeira = false and cnpj is not null)
    or (estrangeira = true and tax_id is not null)
    -- registros em elaboração (ainda sem documento preenchido) também são
    -- permitidos; a validação "dura" fica a cargo da aplicação.
    or (cnpj is null and tax_id is null)
  )
);

create trigger empresas_set_atualizado_em
  before update on empresas
  for each row execute function set_atualizado_em();

-- Uma empresa pode acumular vários papéis (ex.: cliente E exportador).
create table empresa_relacionamentos (
  empresa_id uuid not null references empresas(id) on delete cascade,
  tipo tipo_relacionamento_empresa not null,
  primary key (empresa_id, tipo)
);

create table contatos_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  -- Soft delete, mesmo padrão de empresas.ativo.
  ativo boolean not null default true
);

create index contatos_empresa_empresa_id_idx on contatos_empresa(empresa_id);

-- ============================================================
-- Empresa Config — perfil da própria Fiorini (linha única)
-- ============================================================

create table empresa_config (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  razao_social text not null,
  cnpj text,
  responsavel text,
  endereco text,
  email text,
  telefone text,
  banco text,
  agencia text,
  conta text,
  pix text,
  logo_horizontal_url text,
  icone_url text,
  atualizado_em timestamptz not null default now()
);

create trigger empresa_config_set_atualizado_em
  before update on empresa_config
  for each row execute function set_atualizado_em();

-- Garante uma única linha de configuração.
create unique index empresa_config_singleton_idx on empresa_config((true));

-- ============================================================
-- Usuários — perfil de app associado ao auth.users do Supabase
-- (senha/login ficam inteiramente a cargo do Supabase Auth)
-- ============================================================

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  cargo text,
  criado_em timestamptz not null default now(),
  -- Soft delete — "inativar" revoga o acesso sem apagar o registro.
  ativo boolean not null default true
);

-- ============================================================
-- Preferências do sistema — linha única, separada de empresa_config
-- porque não é dado institucional, é comportamento do front-end.
-- ============================================================

create type separador_numero_pi as enum ('hifen', 'nenhum');

create table preferencias_sistema (
  id uuid primary key default gen_random_uuid(),
  -- Controla só a EXIBIÇÃO do número do PI (PI-123 vs PI123).
  -- processos.numero continua sempre "PI-{sequência}".
  separador_numero_pi separador_numero_pi not null default 'hifen'
);

-- Garante uma única linha de preferências.
create unique index preferencias_sistema_singleton_idx on preferencias_sistema((true));

-- ============================================================
-- Processos de Importação (PI)
-- ============================================================

create type pi_status as enum (
  'aberto',
  'contratacao_frete',
  'em_transito',
  'desembaraco',
  'carregamento',
  'encerramento',
  'cancelado'
);

create type pi_modal as enum (
  'maritimo',
  'rodoviario',
  'aereo',
  'ferroviario'
);

create type pi_tipo_carga as enum ('FCL', 'LCL');

create table processos (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  cliente_id uuid not null references empresas(id),
  status pi_status not null default 'aberto',
  modal pi_modal not null,
  fornecedor_frete_id uuid references empresas(id),

  -- Informações primárias
  -- fk para empresas com tipo 'exportador'. A UI do PI sugere empresas já
  -- cadastradas e cria um registro novo automaticamente quando o nome
  -- digitado não corresponde a nenhuma (resolvido 2026-08-15).
  exportador_id uuid references empresas(id),
  referencia_cliente text,

  -- Transporte
  licenca_importacao boolean,
  tipo_carga pi_tipo_carga,
  -- Só relevante quando modal = 'maritimo' (validação fica a cargo da aplicação).
  navio text,
  origem text,
  destino text,
  previsao_embarque date,
  previsao_chegada date,
  hbl_hawb text,
  conhecimento_embarque text,
  data_liberacao_mapa date,
  data_chegada date,
  data_presenca_carga date,

  -- Financeiro (numerário)
  numerario_enviado_em date,
  numerario_pago_em date,

  -- Desembaraço
  numero_di text,
  data_ci date,
  data_siscargo date,
  data_icms date,
  data_encerramento date,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index processos_cliente_id_idx on processos(cliente_id);
create index processos_fornecedor_frete_id_idx on processos(fornecedor_frete_id);
create index processos_exportador_id_idx on processos(exportador_id);
create index processos_status_idx on processos(status);

create trigger processos_set_atualizado_em
  before update on processos
  for each row execute function set_atualizado_em();

-- Fornecedores convidados a cotar frete em um PI (independente de qual
-- foi aceito, guardado em processos.fornecedor_frete_id).
create table processo_fornecedores_cotados (
  processo_id uuid not null references processos(id) on delete cascade,
  empresa_id uuid not null references empresas(id),
  primary key (processo_id, empresa_id)
);

create table processo_produtos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  nome text not null,
  -- Quantidade numérica sem unidade de medida associada ainda (kg, peças,
  -- m³...) — decisão em aberto, ver docs/04-schema-banco.md.
  quantidade numeric(14, 3) not null default 1
);

create index processo_produtos_processo_id_idx on processo_produtos(processo_id);

-- ============================================================
-- Numerário
-- ============================================================

-- nao_liberado: em digitação, tudo editável.
-- liberado: travado para edição (o front-end aplica isso via <fieldset disabled>),
--   pode ser desfeito de volta para nao_liberado.
-- pago / cancelado: estados finais alcançados a partir de liberado.
create type numerario_status as enum (
  'nao_liberado',
  'liberado',
  'pago',
  'cancelado'
);

create table numerarios (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null unique references processos(id) on delete cascade,
  invoice text not null default '',
  cotacao_moeda numeric(12, 4) not null default 0,
  status numerario_status not null default 'nao_liberado'
  -- "produto" e "exportador" não são colunas aqui de propósito: duplicariam
  -- processos.produtos / processos.exportador. A geração do numerário (PDF)
  -- deve buscar esses valores do processo pai.
);

-- Catálogo compartilhado de descrições de tributo/despesa sugeridas ao
-- cadastrar um item em numerario_tributos.descricao. Soft-delete via
-- "ativo" — nunca DELETE, para não quebrar a FK opcional abaixo.
create table tributos_catalogo (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true,
  -- Entra automaticamente em todo numerário novo (aplicação filtra por
  -- padrao = true and ativo = true na hora de gerar numerario_tributos).
  padrao boolean not null default false
);

-- Seed: itens que entram automaticamente em todo numerário novo (ver
-- criarNumerario() no front-end / TRIBUTOS_CATALOGO_PADRAO em
-- src/data/mock-data.ts) — é só o estado inicial, editável depois via
-- /admin/tributos, não uma lista fixa no código.
insert into tributos_catalogo (nome, padrao) values
  ('Frete Internacional e Taxas', true),
  ('IPI', true),
  ('PIS', true),
  ('COFINS', true),
  ('Taxa Siscomex', true),
  ('ICMS', true);

create table numerario_tributos (
  id uuid primary key default gen_random_uuid(),
  numerario_id uuid not null references numerarios(id) on delete cascade,
  -- Cópia do valor no momento do cadastro — não deve mudar retroativamente
  -- se o item do catálogo for renomeado ou inativado depois.
  descricao text not null,
  valor numeric(14, 2) not null,
  -- Opcional: só para permitir relatórios agregados por tipo de tributo
  -- sem depender de match textual em "descricao".
  tributo_catalogo_id uuid references tributos_catalogo(id)
);

create index numerario_tributos_numerario_id_idx on numerario_tributos(numerario_id);

-- ============================================================
-- Comentários e anexos
-- ============================================================

create table comentarios (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  autor text not null,
  texto text not null,
  criado_em timestamptz not null default now(),
  visivel_no_portal boolean not null default false,
  estagio pi_status,
  -- Soft delete — "inativar" some da timeline mas preserva o registro.
  ativo boolean not null default true
);

create index comentarios_processo_id_idx on comentarios(processo_id);

create table anexos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  nome_arquivo text not null,
  tamanho_bytes bigint not null,
  enviado_em timestamptz not null default now(),
  visivel_no_portal boolean not null default false,
  -- caminho no bucket do Supabase Storage (substitui a object URL local
  -- usada no front-end mockado)
  storage_path text
);

create index anexos_processo_id_idx on anexos(processo_id);
