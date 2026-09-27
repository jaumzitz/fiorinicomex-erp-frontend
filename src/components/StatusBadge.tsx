import { cn } from '@/lib/utils'
import { PI_STATUS_LABELS, type PiStatus } from '@/types/domain'

export const STATUS_DOT_CLASS: Record<PiStatus, string> = {
  contratacao_frete: 'bg-status-frete',
  aberto: 'bg-status-aberto',
  em_transito: 'bg-status-transito',
  desembaraco: 'bg-status-desembaraco',
  carregamento: 'bg-status-carregamento',
  encerramento: 'bg-status-encerramento',
  cancelado: 'bg-status-cancelado',
}

export function StatusBadge({ status }: { status: PiStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium">
      <span className={cn('size-1.5 rounded-full', STATUS_DOT_CLASS[status])} />
      {PI_STATUS_LABELS[status]}
    </span>
  )
}
