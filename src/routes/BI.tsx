import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  countByCliente,
  countByStatus,
  proximasChegadas,
  proximosEmbarques,
} from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { useProcessos } from '@/store/ProcessosContext'
import { useFormatarNumeroPi } from '@/store/PreferenciasContext'
import { PI_STATUSES } from '@/types/domain'

export default function BI() {
  const { processos } = useProcessos()
  const formatarPi = useFormatarNumeroPi()
  const statusCounts = countByStatus(processos)
  const porCliente = countByCliente(processos)
  const embarques = proximosEmbarques(processos, 10)
  const chegadas = proximasChegadas(processos, 10)
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1)

  return (
    <div>
      <PageHeader
        title="BI"
        description="Indicadores operacionais da Fiorini Comex"
      />

      <div className="grid grid-cols-1 gap-4 px-8 py-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processos por estágio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {PI_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <StatusBadge status={status} />
                  </div>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${(statusCounts[status] / maxStatusCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-6 text-right text-sm">
                    {statusCounts[status]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processos por cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {porCliente.map(({ cliente, total }) => (
                <li
                  key={cliente?.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{cliente?.nomeFantasia}</span>
                  <span className="text-muted-foreground">{total}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos embarques programados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {embarques.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{formatarPi(p.numero)}</span>
                  <span className="text-muted-foreground">
                    {formatarData(p.previsaoEmbarque)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas chegadas programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {chegadas.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{formatarPi(p.numero)}</span>
                  <span className="text-muted-foreground">
                    {formatarData(p.previsaoChegada)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
