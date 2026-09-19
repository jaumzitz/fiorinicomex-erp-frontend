export const PI_STATUSES = [
  'aberto',
  'contratacao_frete',
  'em_transito',
  'desembaraco',
  'carregamento',
  'encerramento',
  'cancelado',
] as const

export type PiStatus = (typeof PI_STATUSES)[number]

export const PI_STATUS_LABELS: Record<PiStatus, string> = {
  aberto: 'Aberto',
  contratacao_frete: 'Contratação de Frete',
  em_transito: 'Em Trânsito',
  desembaraco: 'Desembaraço',
  carregamento: 'Carregamento',
  encerramento: 'Encerramento',
  cancelado: 'Cancelado',
}

export type Modal = 'maritimo' | 'rodoviario' | 'aereo' | 'ferroviario'

export const MODAL_LABELS: Record<Modal, string> = {
  maritimo: 'Marítimo',
  rodoviario: 'Rodoviário',
  aereo: 'Aéreo',
  ferroviario: 'Ferroviário',
}

export type TipoCarga = 'FCL' | 'LCL'

export const TIPO_CARGA_LABELS: Record<TipoCarga, string> = {
  FCL: 'FCL — Container fechado',
  LCL: 'LCL — Carga consolidada',
}

export const TIPOS_RELACIONAMENTO_EMPRESA = [
  'cliente',
  'exportador',
  'fornecedor_frete',
  'agente_carga',
  'transportador',
  'recinto',
] as const

export type TipoRelacionamentoEmpresa = (typeof TIPOS_RELACIONAMENTO_EMPRESA)[number]

export const TIPO_RELACIONAMENTO_EMPRESA_LABELS: Record<TipoRelacionamentoEmpresa, string> = {
  cliente: 'Cliente',
  exportador: 'Exportador',
  fornecedor_frete: 'Fornecedor de frete',
  agente_carga: 'Agente de carga',
  transportador: 'Transportador',
  recinto: 'Recinto',
}

export interface ContatoEmpresa {
  id: string
  nome: string
  telefone?: string
  email?: string
  /** Soft delete — contato inativo some das listagens mas nunca é removido. */
  ativo: boolean
}

export interface Empresa {
  id: string
  nomeFantasia: string
  razaoSocial: string
  tiposRelacionamento: TipoRelacionamentoEmpresa[]
  /** Empresa brasileira (false, usa cnpj) ou estrangeira (true, usa taxId + pais). */
  estrangeira: boolean
  cnpj?: string
  /** Identificador fiscal equivalente ao CNPJ para empresas estrangeiras (ex.: Tax ID/EIN nos EUA, VAT number na UE). */
  taxId?: string
  pais?: string
  site?: string
  telefone?: string
  email?: string
  contatos: ContatoEmpresa[]
  /** Soft delete — empresa inativa some das listagens/sugestões mas nunca é removida. */
  ativo: boolean
}

export interface Usuario {
  id: string
  nome: string
  email: string
  cargo?: string
  criadoEm: string
}

export interface Comentario {
  id: string
  autor: string
  texto: string
  criadoEm: string
  visivelNoPortal: boolean
  estagio?: PiStatus
  /** Soft delete — comentário inativo some da timeline mas nunca é removido. */
  ativo: boolean
}

export interface Anexo {
  id: string
  nomeArquivo: string
  tamanhoBytes: number
  enviadoEm: string
  visivelNoPortal: boolean
  /** URL local (object URL) do arquivo, quando disponível nesta sessão. */
  url?: string
}

export interface ItemTributo {
  descricao: string
  valor: number
}

export interface Produto {
  id: string
  nome: string
  quantidade: number
}

export interface TributoCatalogo {
  nome: string
  ativo: boolean
}

export interface DadosBancarios {
  banco: string
  agencia: string
  conta: string
  pix: string
}

export const NUMERARIO_STATUSES = ['nao_liberado', 'liberado', 'pago', 'cancelado'] as const

export type NumerarioStatus = (typeof NUMERARIO_STATUSES)[number]

export const NUMERARIO_STATUS_LABELS: Record<NumerarioStatus, string> = {
  nao_liberado: 'Em digitação',
  liberado: 'Liberado',
  pago: 'Pago',
  cancelado: 'Cancelado',
}

export interface Numerario {
  invoice: string
  cotacaoMoeda: number
  tributos: ItemTributo[]
  status: NumerarioStatus
}

export interface EmpresaConfig {
  nome: string
  razaoSocial: string
  cnpj: string
  responsavel: string
  endereco: string
  email: string
  telefone: string
  dadosBancarios: DadosBancarios
  logoHorizontalUrl?: string
  iconeUrl?: string
}

export interface ProcessoImportacao {
  id: string
  numero: string
  clienteId: string
  status: PiStatus
  modal: Modal
  fornecedoresCotadosIds?: string[]
  fornecedorFreteId?: string
  /** FK para Empresa com tiposRelacionamento incluindo 'exportador'. */
  exportadorId?: string
  referenciaCliente?: string
  licencaImportacao?: boolean
  tipoCarga?: TipoCarga
  navio?: string
  origem?: string
  destino?: string
  previsaoEmbarque?: string
  previsaoChegada?: string
  hblHawb?: string
  conhecimentoEmbarque?: string
  dataLiberacaoMapa?: string
  dataChegada?: string
  dataPresencaCarga?: string
  numerario?: Numerario
  numerarioEnviadoEm?: string
  numerarioPagoEm?: string
  numeroDi?: string
  dataCi?: string
  dataSiscargo?: string
  dataIcms?: string
  dataEncerramento?: string
  produtos: Produto[]
  criadoEm: string
  atualizadoEm: string
  comentarios: Comentario[]
  anexos: Anexo[]
}
