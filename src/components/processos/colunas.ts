import { getCliente, getEmpresa } from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import {
  MODAL_LABELS,
  NUMERARIO_STATUS_LABELS,
  TIPO_CARGA_LABELS,
  type ProcessoImportacao,
} from '@/types/domain'

export const CHAVE_COLUNAS = 'fiorini-comex:colunas-processos'

export type ColunaId =
  | 'cliente'
  | 'cnpj'
  | 'estagio'
  | 'modal'
  | 'exportador'
  | 'referenciaCliente'
  | 'licencaImportacao'
  | 'tipoCarga'
  | 'navio'
  | 'origem'
  | 'destino'
  | 'previsaoEmbarque'
  | 'previsaoChegada'
  | 'hblHawb'
  | 'conhecimentoEmbarque'
  | 'fornecedorFrete'
  | 'dataLiberacaoMapa'
  | 'dataChegada'
  | 'dataPresencaCarga'
  | 'numeroDi'
  | 'dataCi'
  | 'dataSiscargo'
  | 'dataIcms'
  | 'dataEncerramento'
  | 'numerarioStatus'
  | 'numerarioInvoice'
  | 'numerarioTotal'
  | 'numerarioEnviadoEm'
  | 'numerarioPagoEm'
  | 'produtos'
  | 'comentarios'
  | 'anexos'
  | 'criadoEm'
  | 'atualizadoEm'

export const COLUNAS_DISPONIVEIS: { id: ColunaId; label: string }[] = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'estagio', label: 'Estágio' },
  { id: 'exportador', label: 'Exportador' },
  { id: 'referenciaCliente', label: 'Referência cliente' },
  { id: 'modal', label: 'Modal' },
  { id: 'licencaImportacao', label: 'LPCO' },
  { id: 'tipoCarga', label: 'Tipo de carga' },
  { id: 'navio', label: 'Navio' },
  { id: 'origem', label: 'Origem' },
  { id: 'destino', label: 'Destino' },
  { id: 'previsaoEmbarque', label: 'Previsão de embarque' },
  { id: 'previsaoChegada', label: 'Previsão de chegada' },
  { id: 'hblHawb', label: 'HBL / HAWB' },
  { id: 'conhecimentoEmbarque', label: 'CE Mercante' },
  { id: 'fornecedorFrete', label: 'Fornecedor de frete' },
  { id: 'dataLiberacaoMapa', label: 'Liberação MAPA' },
  { id: 'dataChegada', label: 'Data de chegada' },
  { id: 'dataPresencaCarga', label: 'Presença de carga' },
  { id: 'numeroDi', label: 'Nº DI' },
  { id: 'dataCi', label: 'Data do CI' },
  { id: 'dataSiscargo', label: 'Siscarga' },
  { id: 'dataIcms', label: 'Pagamento ICMS' },
  { id: 'dataEncerramento', label: 'Data de encerramento' },
  { id: 'numerarioStatus', label: 'Status do numerário' },
  { id: 'numerarioInvoice', label: 'Invoice' },
  { id: 'numerarioTotal', label: 'Total do numerário' },
  { id: 'numerarioEnviadoEm', label: 'Data de emissão' },
  { id: 'numerarioPagoEm', label: 'Data de pagamento' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'comentarios', label: 'Comentários' },
  { id: 'anexos', label: 'Anexos' },
  { id: 'criadoEm', label: 'Criado em' },
  { id: 'atualizadoEm', label: 'Atualizado em' },
]

export interface ColunaEstado {
  id: ColunaId
  visivel: boolean
}

const COLUNAS_PADRAO_VISIVEIS: ColunaId[] = [
  'cliente',
  'estagio',
  'modal',
  'exportador',
  'referenciaCliente',
  'previsaoEmbarque',
  'previsaoChegada',
  'atualizadoEm',
]

export function colunasIniciais(): ColunaEstado[] {
  const padrao = COLUNAS_DISPONIVEIS.map((c) => ({
    id: c.id,
    visivel: COLUNAS_PADRAO_VISIVEIS.includes(c.id),
  }))
  try {
    const salvo = localStorage.getItem(CHAVE_COLUNAS)
    if (!salvo) return padrao
    const salvas: ColunaEstado[] = JSON.parse(salvo)
    const idsValidos = new Set(COLUNAS_DISPONIVEIS.map((c) => c.id))
    const existentes = salvas.filter((c) => idsValidos.has(c.id))
    const idsExistentes = new Set(existentes.map((c) => c.id))
    const faltantes = padrao.filter((c) => !idsExistentes.has(c.id))
    return [...existentes, ...faltantes]
  } catch {
    return padrao
  }
}

export function celulaColuna(p: ProcessoImportacao, id: ColunaId): string {
  switch (id) {
    case 'cliente':
      return getCliente(p.clienteId)?.nomeFantasia ?? '—'
    case 'cnpj':
      return getCliente(p.clienteId)?.cnpj ?? '—'
    case 'estagio':
      return ''
    case 'modal':
      return MODAL_LABELS[p.modal]
    case 'exportador':
      return p.exportadorId ? (getEmpresa(p.exportadorId)?.nomeFantasia ?? '—') : '—'
    case 'referenciaCliente':
      return p.referenciaCliente ?? '—'
    case 'licencaImportacao':
      return p.licencaImportacao ? 'Necessária' : 'Não necessária'
    case 'tipoCarga':
      return p.tipoCarga ? TIPO_CARGA_LABELS[p.tipoCarga] : '—'
    case 'navio':
      return p.navio ?? '—'
    case 'origem':
      return p.origem ?? '—'
    case 'destino':
      return p.destino ?? '—'
    case 'previsaoEmbarque':
      return formatarData(p.previsaoEmbarque) || '—'
    case 'previsaoChegada':
      return formatarData(p.previsaoChegada) || '—'
    case 'hblHawb':
      return p.hblHawb ?? '—'
    case 'conhecimentoEmbarque':
      return p.conhecimentoEmbarque ?? '—'
    case 'fornecedorFrete':
      return p.fornecedorFreteId ? (getEmpresa(p.fornecedorFreteId)?.nomeFantasia ?? '—') : '—'
    case 'dataLiberacaoMapa':
      return formatarData(p.dataLiberacaoMapa) || '—'
    case 'dataChegada':
      return formatarData(p.dataChegada) || '—'
    case 'dataPresencaCarga':
      return formatarData(p.dataPresencaCarga) || '—'
    case 'numeroDi':
      return p.numeroDi ?? '—'
    case 'dataCi':
      return formatarData(p.dataCi) || '—'
    case 'dataSiscargo':
      return formatarData(p.dataSiscargo) || '—'
    case 'dataIcms':
      return formatarData(p.dataIcms) || '—'
    case 'dataEncerramento':
      return formatarData(p.dataEncerramento) || '—'
    case 'numerarioStatus':
      return p.numerario ? NUMERARIO_STATUS_LABELS[p.numerario.status] : '—'
    case 'numerarioInvoice':
      return p.numerario?.invoice || '—'
    case 'numerarioTotal': {
      if (!p.numerario) return '—'
      const total = p.numerario.tributos.reduce((soma, item) => soma + item.valor, 0)
      return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
    case 'numerarioEnviadoEm':
      return formatarData(p.numerarioEnviadoEm) || '—'
    case 'numerarioPagoEm':
      return formatarData(p.numerarioPagoEm) || '—'
    case 'produtos':
      return p.produtos.length > 0 ? p.produtos.map((produto) => produto.nome).join(', ') : '—'
    case 'comentarios':
      return String(p.comentarios.length)
    case 'anexos':
      return String(p.anexos.length)
    case 'criadoEm':
      return formatarData(p.criadoEm) || '—'
    case 'atualizadoEm':
      return formatarData(p.atualizadoEm)
  }
}
