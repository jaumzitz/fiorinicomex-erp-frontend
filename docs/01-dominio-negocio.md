# Domínio de negócio

> Fonte primária, mais detalhada: [`fiorini-comex-contexto.md`](../fiorini-comex-contexto.md)
> (documento de requisitos original, com o BPMN do processo e itens ainda em aberto).
> Este arquivo é um resumo orientado a quem vai modelar dados/API, já refletindo
> o que foi efetivamente implementado no front-end.

## A empresa

Fiorini Comex é uma **despachante aduaneira** (empresa de importação) operada
por **uma única pessoa** no dia a dia (mais o desenvolvedor como segundo
usuário administrativo). O sistema é de uso interno para administrar os
processos de importação dos clientes, mais um **portal do cliente** (somente
leitura, ainda não implementado) para os clientes acompanharem o andamento —
autenticado por e-mail+senha (conta, vê todos os PIs da empresa) ou por um
link/token vinculado a um PI específico (sem conta); autenticação por CNPJ foi
descartada. Ver [05-implantacao-aws.md](05-implantacao-aws.md) para o desenho
completo.

## Glossário

| Termo | Significado |
|---|---|
| **PI** | Processo de Importação — unidade central de trabalho, `PI-{sequência}` |
| **DI** | Declaração de Importação — registrada no Siscomex durante o trânsito |
| **DUIMP** | Declaração Única de Importação — versão mais nova da DI, registrada no desembaraço |
| **CE Mercante** | Conhecimento de Embarque eletrônico, obrigatório para carga marítima |
| **HBL/HAWB** | House Bill of Lading / House Air Waybill — conhecimento emitido pelo agente de carga (forwarder), distinto do Master BL/AWB do armador/companhia aérea |
| **MAPA** | Ministério da Agricultura — precisa liberar certas cargas antes da digitação da DI |
| **LPCO** (ex-"LI") | Licença/Permissão/Certificado/Outros — autorização prévia exigida para produtos sujeitos a controle de órgão anuente (Anvisa, MAPA, Inmetro etc.); nem todo PI precisa |
| **Recinto** | Local (porto/aeroporto/terminal) onde a carga chega e é feita a análise documental que libera a retirada |
| **Numerário** | Documento com a estimativa de custos (frete + tributos) enviado ao cliente ~5–7 dias antes da chegada da carga, para pagamento antecipado. Estrutura: dados do processo (cliente, produto, invoice, exportador, cotação da moeda) + tabela de tributos/despesas + total + dados bancários para pagamento. Formato de saída alvo: **PDF** (hoje é uma planilha Excel manual) |
| **Canal de parametrização** | Nível de fiscalização aplicado pela Receita Federal na análise documental (verde/amarelo/vermelho). Modelado no schema (2026-09-27) como `processos.canal_parametrizacao`, na aba Desembaraço — só conhecido depois que a DI é registrada. Ainda não existe no front-end mockado (`domain.ts`), que é Fase 1 |
| **FCL / LCL** | Só carga marítima. FCL = container fechado exclusivo do cliente. LCL = carga consolidada, container dividido com outros embarcadores |
| **Presença de carga** | Registro no Siscomex, feito pelo recinto, confirmando chegada física da carga — pré-requisito para registrar a DI |
| **Fornecedores de frete** | Prestadores de frete internacional cotados pela Fiorini. Lista fixa histórica: BDN, PRO-ALLOG, TRANSIT, AGL — hoje modelados como `Empresa` com `tiposRelacionamento` incluindo `fornecedor_frete`, não mais uma lista hardcoded |

Modais de transporte suportados: **marítimo, rodoviário, aéreo, ferroviário**.

## Papéis de empresa (`tiposRelacionamento`)

O sistema unificou "clientes", "fornecedores", "exportadores" etc. em uma
única entidade `Empresa`, que pode acumular múltiplos papéis simultaneamente
(ex.: uma empresa pode ser cliente **e** exportador):

- `cliente`
- `exportador`
- `fornecedor_frete`
- `agente_carga`
- `transportador`
- `recinto`

## Fluxo de status do PI

```
Aberto → Contratação de Frete → Em Trânsito → Desembaraço → Carregamento → Encerramento
```

Mais um status fora do fluxo sequencial: **Cancelado** (pode ser aplicado a
partir de qualquer estágio, quando o processo é abortado).

Notas sobre o fluxo:
- "Informações Iniciais" (troca de e-mails antes do PI existir formalmente)
  **não** é um status rastreado no sistema.
- "Contratação de Frete" é uma etapa própria, depois que o PI já está aberto
  — não é um pré-requisito para abrir o PI.
- Regras de "campo obrigatório por status" existem na cabeça do usuário hoje
  (planilha manual); no sistema atual (Fase 1) não há validação obrigatória
  por status — é um candidato a regra de negócio a implementar no back-end.

## Fluxo do Numerário (dentro do PI, aba Financeiro)

O Numerário passou de "documento único enviado uma vez" para um **objeto com
estado próprio**, gerenciado dentro do PI:

```
(sem numerário) → Em digitação → Aguardando pagamento ⇄ Pago
                                          ↓
                                     (Cancelado — sem gatilho na UI ainda)
```

O front-end (`ProcessoDrawer.tsx`, aba Financeiro) expõe uma **barra de ações
dinâmica**: os botões visíveis mudam conforme `numerario.status`, refletindo
só as transições válidas a partir do estado atual (nenhuma tela pede pro
usuário decidir "qual botão devo clicar" — só aparece o que faz sentido):

- **Em digitação** (`nao_liberado`, rótulo "Em digitação"): estado inicial ao
  clicar "Adicionar numerário". Todos os campos (invoice, cotação,
  tributos/despesas) ficam editáveis livremente. Ações disponíveis:
  **Excluir numerário** e **Liberar numerário**.
- **Aguardando pagamento** (`liberado` — o valor interno do enum não mudou,
  só o rótulo exibido, de "Liberado" para "Aguardando pagamento"): o usuário
  confirma que os dados estão corretos e "trava" o numerário — os campos
  ficam somente-leitura (`<fieldset disabled>`). Ações disponíveis:
  **Desfazer liberação** (com confirmação — reabre edição), **Registrar
  pagamento** (com confirmação — marca como pago e preenche "Data de
  pagamento" com hoje se estiver vazia), **Enviar por e-mail** (preenche
  "Data de emissão" com hoje se vazia — envio de e-mail de verdade é Fase 2,
  hoje só registra a data) e **Ver Numerário** (preview/impressão).
- **Pago**: fim do fluxo normal. Ações disponíveis: **Enviar por e-mail**
  (reenvio) e **Ver Numerário**. Não é mais possível desfazer a liberação a
  partir daqui (evita reabrir edição de algo já pago) nem excluir.
- **Cancelado**: estado alcançável hoje só via dados mockados — a UI ainda
  não tem um botão que leve a esse estado (candidato a decisão de produto:
  cancelar a partir de qual estado? Aguardando pagamento? Também de Pago,
  como estorno?).
- Excluir o numerário só é permitido enquanto está **em digitação** (soft
  guard no front-end, deve virar regra de negócio no back-end também).
- Botão de **logs de auditoria** existe na UI (ícone de histórico, sempre
  visível) mas abre um placeholder "ainda não implementado" — depende de
  usuários/autenticação de verdade, que é Fase 2.

Os **tributos/despesas** de um numerário são uma lista livre de itens
(descrição + valor), mas com um **catálogo compartilhado** de descrições
sugeridas (`TributoCatalogo`, ver [03-modelo-dominio.md](03-modelo-dominio.md)) —
seis itens padrão que entram automaticamente em todo numerário novo (Frete
Internacional e Taxas, IPI, PIS, COFINS, Taxa Siscomex, ICMS), mais itens
customizados que o usuário digita e que passam a existir no catálogo para
reutilização futura. Itens do catálogo podem ser **inativados** (nunca
excluídos) — um item inativo some das sugestões mas não afeta numerários que
já o usam.

## Produtos do PI

Cada PI lista as mercadorias importadas como **nome + quantidade** (lista
livre, editável in-place na seção Produtos do drawer). A quantidade no
front-end mockado (Fase 1) ainda não tem unidade de medida associada; no
schema (2026-09-27) já existe `processo_produtos.unidade_medida`, um enum
fixo (`kg`, `unidade`, `caixa`, `tonelada`, `litro`, `m3`) — falta só chegar
no front-end quando a Fase 2 substituir os dados mockados. O nome dos
produtos é o que aparece no campo "Produto" do numerário.

## Comentários e anexos

Comentários e anexos são sempre vinculados a um PI, com um flag
`visivelNoPortal` (**padrão: oculto**, rotulado na UI como "Visível só para
mim") que controla se aparecem no portal do cliente. Comentários também podem
opcionalmente carregar o `estagio` (status do PI) em que foram criados, para
dar contexto na timeline.

Comentários são **inativados** (soft delete, somem da timeline mas ficam no
histórico). Anexos são **excluídos de verdade**, atrás de um diálogo de
confirmação; além disso podem ser renomeados, abertos e baixados.

## Portal do cliente (não implementado ainda)

- Consulta por CNPJ ou token do processo (sem login tradicional).
- Linha do tempo do processo.
- Só comentários/anexos marcados como `visivelNoPortal`.
- Download de documentos.
- Estágio especial "Pagamento Disponível" com QR code + dados bancários.

## Itens ainda em aberto (do documento de requisitos original)

- Significado exato de dois campos vindos da planilha atual: **CI** e
  **SISCARGO** (hipóteses registradas em `fiorini-comex-contexto.md` §2.1,
  já modelados no sistema como `dataCi`/`dataSiscargo` sob essa hipótese).
- Unidade de medida da quantidade dos produtos.
- Onde entra o **canal de parametrização** (verde/amarelo/vermelho): ainda
  não existe campo para ele no PI.
- Regras de campo-obrigatório-por-status.
- Geração do Numerário como PDF (hoje só existe uma prévia em HTML dentro do
  drawer, `NumerarioPreview.tsx`).
- Envio de e-mail (notificação de status, envio do Numerário) — nenhuma
  integração de provedor de e-mail existe ainda.
- ~~Hospedagem (Hostinger VPS vs. AWS vs. Vercel)~~ → confirmado 2026-09-27:
  **AWS** (Aurora Serverless v2 + Lambda/API Gateway + S3 + Cognito). Ver
  [05-implantacao-aws.md](05-implantacao-aws.md).
