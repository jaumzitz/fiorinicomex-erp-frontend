# Implantação na AWS (Fase 2)

Plano de arquitetura para hospedar o back-end e o portal do cliente. Hospedagem
definida em 2026-09-27 (era Supabase até então — ver nota em
[04-schema-banco.md](04-schema-banco.md) e em
[`fiorini-comex-contexto.md`](../fiorini-comex-contexto.md)). Prioridade
explícita: fazer certo, sem pressa — não há urgência de prazo empurrando
decisões apressadas.

## Decisões (2026-09-27)

| Peça | Escolha | Por quê |
|---|---|---|
| Banco | **Aurora Serverless v2** (Postgres) | Variante do RDS: mesma engine Postgres, mas escala a quase zero em tráfego ocioso (o caso daqui — poucos usuários internos + tráfego irregular do portal) em vez de cobrar 24/7 por uma instância fixa. Expõe a **Data API** (HTTP), o que deixa o Lambda falar com o banco **sem precisar estar dentro de uma VPC** — remove a maior fonte de complexidade de um setup serverless com RDS (VPC, NAT Gateway, cold start em VPC). |
| API | **Lambda + API Gateway** (HTTP API) | Serverless — sem servidor pra manter no ar, escala e cobra por uso. Uma função por rota/recurso. Prioridade era "mínimo esforço operacional". |
| Front-end (ERP interno + portal do cliente) | **AWS Amplify Hosting**, **dois apps separados** (decidido 2026-09-27) | Deploy automático a partir do git push, CDN + HTTPS + domínio próprio inclusos — sem montar S3+CloudFront+pipeline na mão. Dois apps (não duas rotas de um build só) para isolar bem o ERP interno do portal do cliente — públicos e níveis de acesso diferentes. |
| Storage | **S3**, bucket privado | Anexos do PI e as imagens de `empresa_config` (logo/ícone). Acesso só via **presigned URLs** (upload e download) geradas pela API — nunca bucket público, nunca bytes de arquivo passando pelo Lambda. |
| IaC | **AWS CDK** (TypeScript) | Toda a infra (Aurora, Lambdas, Cognito, buckets, Amplify) definida em código, versionada — nada configurado manualmente no console. Mesma linguagem do front-end/API. |

## Modelo de autenticação

Três mecanismos, para três públicos diferentes — **não é um auth único**:

1. **Cognito User Pool "interno"** — os 2 usuários administrativos: o
   operador/admin (uso diário) e o desenvolvedor. Login tradicional
   (e-mail/usuário + senha), integrado como authorizer no API Gateway.
2. **Cognito User Pool "portal do cliente"** — clientes com conta própria
   (**e-mail + senha**, decidido 2026-09-27). Uma empresa cliente pode ter
   **múltiplas contas** (pessoas diferentes da mesma empresa, decidido
   2026-09-27) — cada conta vê todos os PIs da empresa (`clienteId`) à qual
   está associada.
3. **Link assinado por PI** (decidido 2026-09-27) — **não** é conta, **não**
   passa pelo Cognito. Um JWT contendo `{ processoId, ver }`, gerado pela
   API e verificado por um Lambda authorizer numa rota de leitura
   específica ("ver este PI"). É o equivalente a "compartilhar este
   processo por link" — escopo de um único PI, nunca a conta inteira do
   cliente.
   - **Expiração (decidido 2026-09-27)**: 30 dias após `data_encerramento`
     ou depois que o PI virar `cancelado`. Como essa data não existe ainda
     no momento em que o link é gerado (o PI normalmente está aberto), o
     JWT **não** carrega um `exp` fixo calculado na emissão — a regra é
     avaliada **a cada request**, no Lambda authorizer, comparando a data
     atual contra `processos.data_encerramento`/`status` (dado sempre
     atualizado, ao contrário de um `exp` congelado no token). O JWT em si
     leva um `exp` bem distante só como teto de segurança (ex.: 1 ano),
     não como o mecanismo real de expiração.
   - **Revogação sem blacklist (decidido 2026-09-27)**: `ver` é comparado
     contra uma coluna `processos.link_token_version` (inteiro, default
     `0`). Revogar = incrementar essa coluna — invalida **todos** os links
     já emitidos pra aquele PI de uma vez. A UI pode gerar um link novo a
     qualquer momento (ação explícita — "gerar novo link", não é
     automático).

**Descartado (2026-09-27): autenticação por CNPJ.** Os requisitos originais
(`fiorini-comex-contexto.md`, seção 9) previam "CNPJ ou token" — o CNPJ como
credencial saiu, substituído por e-mail+senha (mecanismo 2 acima). O token
(mecanismo 3) continua, mas com escopo de PI único, não de conta.

O portal do cliente continua **somente leitura** (ver
[01-dominio-negocio.md](01-dominio-negocio.md)) — nenhum dos três mecanismos
acima habilita escrita, só o que já é possível hoje (visualizar PI,
comentários/anexos com `visivelNoPortal`, numerário).

### Implicação no schema — `portal_usuarios` (nova tabela, aplicada à migração)

O mecanismo 2 (conta do cliente) precisa mapear a identidade do Cognito para
uma `Empresa`. Como uma empresa pode ter múltiplas contas (decidido
2026-09-27), é uma relação N:1 simples — sem restrição de unicidade em
`empresa_id`:

```sql
create table portal_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  cognito_sub text not null unique, -- identidade do Cognito User Pool "portal do cliente"
  email text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
```

O mecanismo 3 (link por PI) precisa de uma coluna extra em `processos`:
`link_token_version integer not null default 0`. Ver
[04-schema-banco.md](04-schema-banco.md) para essa coluna e a tabela
`portal_usuarios` já aplicadas na migração, e o diagrama ER atualizado.

## Enforcement de acesso (decidido 2026-09-27)

Filtragem **no código da API** (Lambda), não via RLS no Postgres — com
Cognito + Lambda authorizer, o Lambda já recebe as claims do chamador.
Só as rotas do portal do cliente precisam filtrar por `cliente_id` (usuários
internos veem tudo — despachante de uma pessoa só); o acesso por link já vem
escopado no próprio JWT (`processoId`), não precisa de filtro adicional. RLS
no Postgres fica descartado como mecanismo primário — a superfície que
precisa de disciplina é pequena o suficiente pra um helper compartilhado
(ex.: toda rota do portal passa por uma função `buscarProcessosDoCliente`,
não SQL solto por handler) cobrir sem a complexidade extra de simular sessão
por request na Data API.

## O que ainda falta decidir

Pendências que já existiam antes da escolha de hospedagem (não mudam com
AWS): layout de keys no S3, unidade de medida de `processo_produtos`, canal
de parametrização, geração do Numerário em PDF, envio de e-mail — ver
[04-schema-banco.md](04-schema-banco.md) e [02-frontend.md](02-frontend.md).
