import { useState } from 'react'
import { Calendar } from 'lucide-react'

import { StatusBadge } from '@/components/StatusBadge'
import { ModalIcon } from '@/components/ModalIcon'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { getCliente, getEmpresa } from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { useFormatarNumeroPi } from '@/store/PreferenciasContext'
import { MODAL_LABELS, type ProcessoImportacao } from '@/types/domain'

export function ProcessosCards({
  processos,
  onSelecionar,
  onAbrirNovaAba,
}: {
  processos: ProcessoImportacao[]
  onSelecionar: (id: string) => void
  onAbrirNovaAba: (id: string) => void
}) {
  const formatarPi = useFormatarNumeroPi()
  const [cardContexto, setCardContexto] = useState<string | null>(null)

  if (processos.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border py-10 text-center text-sm">
        Nenhum processo encontrado com os filtros atuais.
      </div>
    )
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
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          onContextMenu={aoAbrirMenuContexto}
        >
          {processos.map((p) => {
            const cliente = getCliente(p.clienteId)
            const exportador = p.exportadorId ? getEmpresa(p.exportadorId) : undefined
            return (
              <Card
                key={p.id}
                data-processo-id={p.id}
                className="cursor-pointer gap-3 py-4 transition-shadow hover:shadow-md"
                onClick={(e) => aoClicarCard(p.id, e)}
              >
                <CardHeader className="grid-cols-1 gap-1 px-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{formatarPi(p.numero)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <span className="text-muted-foreground truncate text-sm">
                    {cliente?.nomeFantasia}
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-1.5 px-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <ModalIcon modal={p.modal} className="text-muted-foreground size-3.5 shrink-0" />
                    <span>{MODAL_LABELS[p.modal]}</span>
                    {exportador && (
                      <span className="text-muted-foreground truncate">
                        — {exportador.nomeFantasia}
                      </span>
                    )}
                  </div>
                  {(p.previsaoEmbarque || p.previsaoChegada) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="text-muted-foreground size-3.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {p.previsaoEmbarque && `Embarque ${formatarData(p.previsaoEmbarque)}`}
                        {p.previsaoEmbarque && p.previsaoChegada && ' · '}
                        {p.previsaoChegada && `Chegada ${formatarData(p.previsaoChegada)}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
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
