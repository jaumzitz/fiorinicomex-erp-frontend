import { AlertTriangle, Ship, Anchor, Wallet } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  countByStatus,
  numerariosPendentes,
  processosAtivos,
  proximasChegadas,
  proximosEmbarques,
  getCliente,
} from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { useProcessos } from '@/store/ProcessosContext'
import { useFormatarNumeroPi } from '@/store/PreferenciasContext'
import { PI_STATUS_LABELS } from '@/types/domain'

export default function Welcome() {
  const { processos } = useProcessos()
  const formatarPi = useFormatarNumeroPi()
  const statusCounts = countByStatus(processos)
  const ativos = processosAtivos(processos)
  const embarques = proximosEmbarques(processos)
  const chegadas = proximasChegadas(processos)
  const pendentes = numerariosPendentes(processos)

  return (
    <div>
      <PageHeader
        title="Boas-vindas"
        description="Visão geral das operações em andamento"
      />

      <div className="grid grid-cols-1 gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Processos ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{ativos.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Numerários pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{pendentes.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Embarques programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{embarques.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Chegadas programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{chegadas.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-8 pb-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processos por estágio</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{PI_STATUS_LABELS[status as keyof typeof PI_STATUS_LABELS]}</span>
                  <Badge variant="secondary">{count}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="text-status-desembaraco size-4" />
              Requer atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendentes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum numerário pendente de pagamento no momento.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {pendentes.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <Wallet className="text-muted-foreground size-4 shrink-0" />
                    <span className="font-medium">{formatarPi(p.numero)}</span>
                    <span className="text-muted-foreground">
                      {getCliente(p.clienteId)?.nomeFantasia} — numerário enviado em{' '}
                      {formatarData(p.numerarioEnviadoEm)}, ainda sem confirmação de
                      pagamento
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ship className="size-4" />
              Próximos embarques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {embarques.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>
                    {formatarPi(p.numero)} — {getCliente(p.clienteId)?.nomeFantasia}
                  </span>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Anchor className="size-4" />
              Próximas chegadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {chegadas.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>
                    {formatarPi(p.numero)} — {getCliente(p.clienteId)?.nomeFantasia}
                  </span>
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
