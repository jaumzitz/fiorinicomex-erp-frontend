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
| Front-end (ERP interno + portal do cliente) | **AWS Amplify Hosting** | Deploy automático a partir do git push, CDN + HTTPS + domínio próprio inclusos — sem montar S3+CloudFront+pipeline na mão. Provavelmente **dois apps Amplify** (o ERP interno e o portal do cliente), já que são públicos e níveis de acesso diferentes; a separação exata (dois apps vs. duas rotas do mesmo build) ainda pode ser revisada quando o portal começar a ser desenhado de verdade. |
| Storage | **S3**, bucket privado | Anexos do PI e as imagens de `empresa_config` (logo/ícone). Acesso só via **presigned URLs** (upload e download) geradas pela API — nunca bucket público, nunca bytes de arquivo passando pelo Lambda. |
| IaC | **AWS CDK** (TypeScript) | Toda a infra (Aurora, Lambdas, Cognito, buckets, Amplify) definida em código, versionada — nada configurado manualmente no console. Mesma linguagem do front-end/API. |

## Modelo de autenticação

Três mecanismos, para três públicos diferentes — **não é um auth único**:

1. **Cognito User Pool "interno"** — os 2 usuários administrativos: o
   operador/admin (uso diário) e o desenvolvedor. Login tradicional
   (e-mail/usuário + senha), integrado como authorizer no API Gateway.
2. **Cognito User Pool "portal do cliente"** — clientes com conta própria
   (**e-mail + senha**, decidido 2026-09-27). Uma conta vê todos os PIs da
   empresa (`clienteId`) à qual está associada.
3. **Link assinado por PI** (decidido 2026-09-27) — **não** é conta, **não**
   passa pelo Cognito. Um token (JWT de vida curta ou longa) contendo
   `{ processoId, exp }`, gerado pela API e verificado por um Lambda
   authorizer numa rota de leitura específica ("ver este PI"). É o
   equivalente a "compartilhar este processo por link" — escopo de um único
   PI, nunca a conta inteira do cliente.

**Descartado (2026-09-27): autenticação por CNPJ.** Os requisitos originais
(`fiorini-comex-contexto.md`, seção 9) previam "CNPJ ou token" — o CNPJ como
credencial saiu, substituído por e-mail+senha (mecanismo 2 acima). O token
(mecanismo 3) continua, mas com escopo de PI único, não de conta.

O portal do cliente continua **somente leitura** (ver
[01-dominio-negocio.md](01-dominio-negocio.md)) — nenhum dos três mecanismos
acima habilita escrita, só o que já é possível hoje (visualizar PI,
comentários/anexos com `visivelNoPortal`, numerário).

### Implicação no schema (ainda não aplicada à migração)

O mecanismo 2 (conta do cliente) precisa mapear a identidade do Cognito para
uma `Empresa` — hoje não existe tabela para isso. Provável nova tabela, algo
como:

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

Perguntas abertas antes de adicionar isso à migração de verdade: uma empresa
cliente pode ter **múltiplas** contas de portal (ex.: mais de uma pessoa da
mesma empresa logando) ou é uma conta por empresa? O nome da tabela e dos
campos está bom, ou prefere outro?

## O que ainda falta decidir

1. **Um app Amplify ou dois** para ERP interno + portal do cliente (ver
   tabela acima).
2. **Multiplicidade de contas do portal** por empresa cliente (pergunta
   acima).
3. **Enforcement de acesso**: com Cognito + Lambda authorizer, o Lambda já
   sabe quem é o chamador (claims do JWT) — a filtragem de "só os PIs deste
   cliente" provavelmente acontece no **código da API** (Lambda), não via
   RLS no Postgres. RLS fica em aberto como camada extra de defesa, não como
   mecanismo primário — a decidir se vale a complexidade.
4. **Vida útil do token por PI** (mecanismo 3): expira? Pode ser revogado
   antes de expirar (ex.: se o cliente pedir)?
5. Pendências que já existiam antes da escolha de hospedagem (não mudam com
   AWS): layout de keys no S3, unidade de medida de `processo_produtos`,
   canal de parametrização, geração do Numerário em PDF, envio de e-mail —
   ver [04-schema-banco.md](04-schema-banco.md) e
   [02-frontend.md](02-frontend.md).
