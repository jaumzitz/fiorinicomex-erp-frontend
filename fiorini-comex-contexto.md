# Fiorini Comex — Contexto do Projeto (ERP)

> Documento de referência para o desenvolvimento do sistema.
> Itens marcados como **[A DECIDIR]** ou **[A CONFIRMAR]** ainda não estão fechados — o resto reflete o que já foi definido.

---

## 1. Sobre a empresa

- Despachante aduaneira / empresa de importação, operação de **1 pessoa**.
- Uso interno do sistema é para um único usuário administrativo.
- **[A COMPLETAR]** — resumo institucional da empresa (em elaboração pelo usuário).

---

## 2. Glossário do domínio

| Termo | Significado |
|---|---|
| PI | Processo de Importação — unidade central de trabalho do sistema, identificado como `PI-{sequência}` |
| DI | Declaração de Importação — rascunho digitado no Siscomex/Portal Único durante o trânsito |
| DUIMP | Declaração Única de Importação — registrada na etapa de desembaraço, após pagamento do numerário |
| CE Mercante | Documento obtido quando o transporte é marítimo |
| MAPA | Órgão que precisa liberar a carga antes da digitação da DI (Ministério da Agricultura) |
| RF | Receita Federal |
| Numerário | Documento com descrição e valores dos serviços contratados, enviado ao cliente entre 5–7 dias antes da chegada da carga. Hoje é montado como planilha do Excel — **[CONFIRMADO 2026-07-15]** não é o mesmo xlsx-modelo de relatórios; no novo sistema o Numerário deve ser **gerado como PDF**. Estrutura de referência (ver PI621 anexo): cabeçalho com logo/dados da Fiorini, nº do PI; bloco "Informações do processo" (cliente, produto, invoice, exportador, cotação da moeda); tabela "Tributos/Despesas" (frete internacional e taxas, anuência de órgão anuente como Anvisa, honorário de despacho, AFRMM, armazenagem, imposto de importação, IPI, PIS, COFINS, taxa Siscomex, ICMS) com total solicitado; bloco de dados bancários (banco, agência/conta, PIX) para pagamento |
| Canal de parametrização | **[CONFIRMADO 2026-07-15]** é como se chamam os tipos/níveis de fiscalização aplicados pela Receita Federal na análise documental (ex.: verde, amarelo, vermelho) |
| Recinto | Local onde a carga chega e onde ocorre a análise documental que libera a retirada |
| Fornecedores de frete | Prestadores de frete internacional cotados pela Fiorini: **BDN, PRO-ALLOG, TRANSIT, AGL**. **[CONFIRMADO 2026-07-15]** não há regra fixa de quantos/quais cotar — é uma **escolha manual a cada PI**, caso a caso. O sistema deve permitir marcar, por PI, quais fornecedores foram convidados a cotar (não um número fixo nem automático) |

Modais de transporte suportados: **marítimo, rodoviário, aéreo, ferroviário**.

## 2.1 Campos identificados na planilha atual (2026-07-17)

Colunas encontradas na planilha de controle usada hoje pela Fiorini, ainda não mapeadas nas telas do sistema. Significado levantado por interpretação do domínio — **nenhum destes está confirmado pelo usuário ainda**.

| Coluna | Tipo | Significado (a confirmar) |
|---|---|---|
| LI | booleano | Licença de Importação — autorização prévia (antes do embarque) exigida só para produtos sujeitos a controle de órgão anuente (Anvisa, MAPA, Inmetro etc.). Booleano porque nem todo PI precisa |
| ETD | data | Estimated Time of Departure — previsão de **saída** da carga na origem |
| ETA | data | Estimated Time of Arrival — previsão de **chegada** no destino (equivalente à "previsão de chegada" já modelada) |
| HBL / HAWB | número | House Bill of Lading / House Air Waybill — conhecimento de embarque emitido pelo agente de carga (forwarder) direto ao cliente, distinto do Master BL/AWB emitido pelo armador/companhia aérea |
| LCL / FCL | enum (FCL \| LCL) | Só carga marítima. FCL = container fechado só com carga do cliente. LCL = carga consolidada, dividindo container com outros embarcadores |
| CE | número | Conhecimento de Embarque (mesmo "CE Mercante" já no glossário) — nº do conhecimento eletrônico no Siscomex Carga, obrigatório para carga marítima |
| MAPA | data | Data em que o MAPA liberou a carga (já documentado na seção 3, etapa "Em Trânsito") |
| PRESENCA | data | Data do registro de "presença de carga" no Siscomex — confirmação, feita pelo recinto, de que a mercadoria chegou fisicamente e está disponível para desembaraço. Pré-requisito para registrar a DI |
| DI | string | Nº de registro da Declaração de Importação no Siscomex |
| CI | data | **[A CONFIRMAR]** Hipótese: Comprovante de Importação, documento/recibo gerado junto com o registro da DI — data de emissão |
| SISCARGO | data | **[A CONFIRMAR]** Hipótese: data de registro/vinculação no módulo Siscomex Carga (controle logístico da carga) — pode ser redundante com PRESENCA, marcando o mesmo evento em outro momento, ou pode ser algo distinto |
| ICMS | data | Data de pagamento do ICMS (imposto estadual) via GNRE — trâmite separado dos tributos federais já cobertos no Numerário |

> **[A CONFIRMAR]** Todos os significados acima, especialmente **CI** e **SISCARGO**, que têm menor confiança de interpretação. Depois de confirmados, decidir onde cada campo entra no modelo do PI (a maioria se encaixa na seção "Transporte" do drawer; DI/CI/ICMS provavelmente formam uma nova sub-seção "Desembaraço").

---

## 3. Processo principal — fluxo de um PI (fonte: BPMN)

Atores do processo: **Cliente**, **Fiorini Comex** (operação), **Prest. Serviço / Fornecedor** (frete internacional).

### Informações iniciais
1. *(Cliente)* Envia documentação de abertura de processo por e-mail
2. *(Fiorini)* Registra na planilha com nº de PI (processo interno)
3. *(Fiorini)* Retorna e-mail com o nº do PI e confirmação dos dados
4. **Decisão:** requer frete internacional? → **Sim**: segue para Contratação de Frete · **Não**: **[A CONFIRMAR]** pula direto para o status Aberto?

### Contratação de Frete Internacional
5. *(Fiorini)* Solicita cotação aos fornecedores de frete (ver glossário)
6. *(Fornecedor)* Retorna cotação: referência (ID), previsão de embarque, previsão de chegada, porto de destino
7. *(Fiorini)* Envia a cotação ao cliente por e-mail
8. *(Cliente)* Escolhe um prestador e responde por e-mail ou WhatsApp
9. *(Fiorini)* Aprova a cotação e solicita dados do embarque ao prestador escolhido

### Status: Aberto
10. *(Fiorini)* Alimenta a planilha na aba "Aberto"
11. *(Fiorini)* Aguarda a data de embarque
12. *(Fiorini)* No dia do embarque, confirma com o prestador se ocorreu
13. *(Fornecedor)* Confirma o embarque ou informa nova data prevista
14. **Decisão:** embarcou na data prevista? → **Não**: atualiza a data prevista (repete a espera) · **Sim**: muda status para Em Trânsito

### Status: Em Trânsito
15. **Decisão:** é transporte marítimo? → **Sim**: obtém o CE Mercante
16. *(Fiorini)* Confere se o MAPA liberou a carga
17. **Decisão:** MAPA liberou? → **Não**: elabora documento solicitando liberação e aguarda inspeção (repete a checagem) · **Sim**: digita rascunho da DI (Siscomex/Portal Único)
18. *(Fiorini)* Monta o Numerário (planilha Excel)
19. *(Fiorini)* Envia o Numerário ao cliente entre 5–7 dias antes da chegada
20. Carga chega no recinto
21. *(Fiorini)* Avisa por e-mail que a carga chegou e solicita o pagamento do Numerário

### Status: Desembaraço
22. *(Cliente)* Paga o Numerário (após a chegada)
23. *(Fiorini)* Aguarda confirmação do pagamento
24. Registro da DUIMP
25. Pagamento de taxas operacionais
26. Envio de documentos para o recinto
27. Análise de documentos pelo recinto
28. Programação da retirada da carga

### Status: Carregamento
29. Carga retirada
30. Carga chega ao cliente

### Status: Encerramento
31. Emissão da NF
32. Envio das despesas ao cliente
33. Finalizado

### Status confirmados (do BPMN)
`Aberto` → `Em Trânsito` → `Desembaraço` → `Carregamento` → `Encerramento`

> **[CONFIRMADO 2026-07-15]** "Informações Iniciais" não é um status rastreado (é só a troca de e-mails de abertura, antes do PI existir formalmente no sistema). "Contratação de Frete" é um status próprio, distinto de "Aberto".
>
> **[CORRIGIDO 2026-07-16]** A ordem sequencial narrada acima (Contratação de Frete antes de Aberto) foi corrigida. Sequência oficial de status do sistema: `Aberto` → `Contratação de Frete` → `Em Trânsito` → `Desembaraço` → `Carregamento` → `Encerramento`. Um PI é aberto primeiro; a contratação de frete acontece como uma etapa dentro do processo já aberto, não antes dele.

## 3.1 Sugestões de complemento (para validar — operação de 1 pessoa)

Como pedido, aqui vão pontos que fazem sentido dado o porte da operação. São sugestões, não requisitos fechados:

- **Lembretes proativos:** sem equipe para "vigiar" prazos, o sistema pode alertar (painel/e-mail) sobre numerário pendente há X dias, embarque previsto para hoje sem confirmação, ou liberação do MAPA parada há muito tempo — hoje esse controle provavelmente é só mental/planilha.
- **Templates de mensagem:** o fluxo já usa textos recorrentes ("segue cotação...", "sua carga chegou, pague o numerário..."). Templates com variáveis (cliente, nº do PI, valores) evitam redigitar isso toda vez.
- **Fornecedores de frete como cadastro reutilizável:** BDN, PRO-ALLOG, TRANSIT, AGL já são fixos — cadastrar uma vez com contato evita repetir dados a cada cotação.
- **Sem fluxo de aprovação interna:** por ser uma pessoa só, não faz sentido modelar hierarquia/aprovação de gestor — qualquer decisão é uma ação direta do usuário.
- **Kanban como visão padrão:** a planilha atual já tem uma aba por status — a visão Kanban (que você já pediu) é provavelmente a mais próxima do hábito de trabalho atual, e pode fazer sentido ser a tela inicial.

---

## 4. Requisitos funcionais

**Cadastros / CRUD**
- Clientes, Fornecedores, Notas fiscais, Processos de Importação (PI)

**Gestão de status**
- Atualização de status do processo
- Alguns status exigem preenchimento de campos específicos (ex: status "Em Trânsito" → exige data prevista de chegada)
- **[Futuro]** regras de campo-por-status devem ser configuráveis; na v1 pode ser hardcoded

**Comentários**
- Vinculados ou não a um estágio específico
- Controle de visibilidade por comentário (checkbox "exibir no portal do cliente")

**Anexos**
- Upload de anexos vinculados a processos

**Comunicação por e-mail**
- Notificação de troca de status por e-mail, **mediante confirmação do usuário** (não é automático/silencioso)
- Geração automática do Numerário + envio por e-mail ao cliente
- *(Implementação do envio via provedor real fica para fase posterior — ver seção 8)*

---

## 5. Portal do Cliente

- Consulta de processos por **CNPJ ou token do processo**
- Linha do tempo com os estágios do processo
- Exibição de comentários/atualizações da operação — **somente os marcados como "exibir no portal do cliente"**
- Download dos documentos associados ao processo
- Estágio especial **"Pagamento Disponível"**: exibe QR Code de pagamento + dados bancários

---

## 6. Telas do sistema

| Tela | Descrição |
|---|---|
| **Processos de Importação** (principal) | Alterna entre tabela / card / kanban — **visão padrão: tabela/lista**. Cada processo é `PI-{sequência}`. Busca e filtros por estágio, cliente, nº do PI. Clique no PI abre drawer editável com os dados do processo. |
| **Boas-vindas** | Dashboard simples com os principais KPIs |
| **BI** | Processos por estágio · Qtd. de processos por cliente · Próximos embarques programados · Próximas chegadas programadas |
| **Administração/Configuração** | Logo da empresa, nome, CNPJ, gestão de usuários (nome, e-mail, senha, cargo) |

---

## 7. Interface / Design

- Estilo moderno, tema claro, tons padrão
- Referências positivas explícitas: **interface do Notion** e **interface do Claude**
- Menu lateral
- Boa densidade de informação, objetivo, fácil leitura e navegação
- Ícones com significado claro
- Responsivo (mobile + desktop)

---

## 8. Arquitetura técnica

**Ordem de execução definida**
1. **Fase 1 (atual):** front-end completo, preparado para consumir API, usando **dados locais/mockados** por enquanto
2. Fases seguintes: a definir conforme o front avança

**Já decidido**
- **Supabase** para autenticação, storage e banco de dados
- Segurança é prioridade: **OAuth2** e demais protocolos de comunicação segura

- **[CONFIRMADO 2026-07-15]** Banco via Supabase: **relacional**

**[A DECIDIR]**
- Hospedagem do servidor: VPS Hostinger (onde já há domínio + WordPress) vs. AWS vs. Vercel
- E-mail: já existe provedor contratado no Google Workspace — implementação de envio fica para fase posterior, não bloqueia agora

---

## 9. Usuários e acesso

- **Interno:** 1 usuário administrativo (a própria Fiorini)
- **Externo:** clientes acessam via **Portal do Cliente**, autenticando por CNPJ ou token do processo (não é login tradicional de usuário do sistema)

---

## 10. Pendências / itens em aberto

- [x] ~~Confirmar nomenclatura DUIM/DUIMP~~ → confirmado: **DUIMP**
- [x] ~~Compartilhar o BPMN~~ → recebido e incorporado à seção 3
- [x] ~~Confirmar se o Numerário é o mesmo xlsx-modelo mencionado para geração de relatórios~~ → confirmado: são coisas diferentes; o Numerário deve ser gerado como **PDF** (estrutura de referência: PI621, ver seção 2)
- [x] ~~Confirmar se "Informações Iniciais" e "Contratação de Frete" são sub-etapas do status "Aberto" ou status próprios~~ → confirmado: "Contratação de Frete" é status próprio; "Informações Iniciais" não é rastreado
- [x] ~~Detalhar "canal de parametrização"~~ → confirmado: tipos/níveis de fiscalização da Receita Federal (verde/amarelo/vermelho)
- [x] ~~Decidir banco relacional vs. não-relacional no Supabase~~ → confirmado: **relacional**
- [x] ~~Confirmar quantos/quais fornecedores de frete são cotados por padrão~~ → confirmado: sem regra fixa, escolha manual a cada PI
- [ ] Recuperar a planilha atual (tem uma aba por status — útil como referência de campos e para migração de dados históricos, se houver)
- [ ] Decidir hospedagem (Hostinger VPS / AWS / Vercel)
- [ ] Reenviar "documentação adicional" — o briefing original parece ter sido cortado antes de anexá-la
- [ ] Confirmar significado dos campos da planilha atual (seção 2.1), em especial **CI** e **SISCARGO**
- [x] ~~Decidir onde os campos da seção 2.1 entram no modelo do PI e nas telas~~ → implementado 2026-09-18 (sob as hipóteses da seção 2.1, que continuam a confirmar): LI → `licencaImportacao` (rotulado "LPCO"), ETD → `previsaoEmbarque`, ETA → `previsaoChegada`, HBL/HAWB → `hblHawb`, LCL/FCL → `tipoCarga`, CE → `conhecimentoEmbarque`, MAPA → `dataLiberacaoMapa`, PRESENCA → `dataPresencaCarga` (todos na seção **Transporte** da aba Processo); DI → `numeroDi`, CI → `dataCi`, SISCARGO → `dataSiscargo`, ICMS → `dataIcms` (aba própria **Desembaraço**). Ver `docs/03-modelo-dominio.md`
- [ ] Definir unidade de medida da quantidade de produto (hoje o PI guarda nome + quantidade numérica, sem unidade)
- [ ] Definir onde entra o **canal de parametrização** no modelo do PI (confirmado como conceito, mas ainda sem campo)
