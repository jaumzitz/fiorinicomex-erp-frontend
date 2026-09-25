import { useState } from 'react'

import { StatusBadge } from '@/components/StatusBadge'
import { ModalIcon } from '@/components/ModalIcon'
import { Badge } from '@/components/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { getCliente } from '@/lib/domain-queries'
import { cn } from '@/lib/utils'
import { useProcessos } from '@/store/ProcessosContext'
import { useFormatarNumeroPi } from '@/store/PreferenciasContext'
import { MODAL_LABELS, PI_STATUSES, type PiStatus, type ProcessoImportacao } from '@/types/domain'

export function ProcessosKanban({
  processos,
  onSelecionar,
  onAbrirNovaAba,
}: {
  processos: ProcessoImportacao[]
  onSelecionar: (id: string) => void
  onAbrirNovaAba: (id: string) => void
}) {
  const { alterarStatus } = useProcessos()
  const formatarPi = useFormatarNumeroPi()
  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const [colunaAlvo, setColunaAlvo] = useState<PiStatus | null>(null)
  const [cardContexto, setCardContexto] = useState<string | null>(null)

  function soltar(status: PiStatus, e: React.DragEvent) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) alterarStatus(id, status)
    setColunaAlvo(null)
    setArrastandoId(null)
  }

  function aoClicarCard(id: string, e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      onAbrirNovaAba(id)
    } else {
      onSelecionar(id)
    }
  }

  function aoAbrirMenuContexto(e: React.MouseEvent<HTMLDivElement>) {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-processo-id]')
    setCardContexto(card?.dataset.processoId ?? null)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex gap-4 overflow-x-auto pb-2" onContextMenu={aoAbrirMenuContexto}>
          {PI_STATUSES.map((status) => {
            const itens = processos.filter((p) => p.status === status)
            return (
              <div
                key={status}
                className={cn(
                  'bg-muted/30 flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2',
                  colunaAlvo === status && 'ring-primary ring-2',
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  setColunaAlvo(status)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setColunaAlvo((atual) => (atual === status ? null : atual))
                  }
                }}
                onDrop={(e) => soltar(status, e)}
              >
                <div className="flex items-center justify-between px-1 py-1">
                  <StatusBadge status={status} />
                  <Badge variant="secondary">{itens.length}</Badge>
                </div>

                <div className="flex flex-col gap-2">
                  {itens.map((p) => {
                    const cliente = getCliente(p.clienteId)
                    return (
                      <div
                        key={p.id}
                        data-processo-id={p.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', p.id)
                          e.dataTransfer.effectAllowed = 'move'
                          setArrastandoId(p.id)
                        }}
                        onDragEnd={() => {
                          setArrastandoId(null)
                          setColunaAlvo(null)
                        }}
                        onClick={(e) => aoClicarCard(p.id, e)}
                        className={cn(
                          'bg-background cursor-grab rounded-md border p-2.5 text-sm shadow-sm active:cursor-grabbing',
                          arrastandoId === p.id && 'opacity-40',
                        )}
                      >
                        <div className="font-medium">{formatarPi(p.numero)}</div>
                        <div className="text-muted-foreground truncate text-xs">
                          {cliente?.nomeFantasia}
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                          <ModalIcon modal={p.modal} className="size-3.5" />
                          {MODAL_LABELS[p.modal]}
                        </div>
                      </div>
                    )
                  })}
                  {itens.length === 0 && (
                    <div className="text-muted-foreground rounded-md border border-dashed p-3 text-center text-xs">
                      Nenhum processo
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          disabled={!cardContexto}
          onSelect={() => cardContexto && onSelecionar(cardContexto)}
        >
          Abrir
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!cardContexto}
          onSelect={() => cardContexto && onAbrirNovaAba(cardContexto)}
        >
          Abrir em nova aba
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
