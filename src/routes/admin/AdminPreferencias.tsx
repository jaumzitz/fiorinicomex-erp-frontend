import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePreferencias } from '@/store/PreferenciasContext'
import { formatarNumeroPi } from '@/lib/numero-pi'
import {
  SEPARADORES_NUMERO_PI,
  SEPARADOR_NUMERO_PI_LABELS,
  type SeparadorNumeroPi,
} from '@/types/domain'

export default function AdminPreferencias() {
  const { preferencias, atualizarPreferencias } = usePreferencias()

  return (
    <div>
      <PageHeader
        voltarTo="/admin"
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Administração', to: '/admin' }, { label: 'Preferências do sistema' }]}
          />
        }
        title="Preferências do sistema"
        description="Parâmetros que mudam o comportamento do front-end para todos os usuários"
      />

      <div className="px-4 py-6 sm:px-8">
        <Card>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-48">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Separador do Nº PI</TableCell>
                    <TableCell className="text-muted-foreground max-w-md text-sm whitespace-normal">
                      Forma de exibição da chave do processo (
                      {formatarNumeroPi('PI-123', 'hifen')} ou{' '}
                      {formatarNumeroPi('PI-123', 'nenhum')}) em Processos, Boas-vindas,
                      Numerário e demais telas. A busca por número de processo entende
                      os dois formatos, independente desta escolha.
                    </TableCell>
                    <TableCell>
                      <Select
                        value={preferencias.separadorNumeroPi}
                        onValueChange={(v) =>
                          atualizarPreferencias({ separadorNumeroPi: v as SeparadorNumeroPi })
                        }
                      >
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEPARADORES_NUMERO_PI.map((separador) => (
                            <SelectItem key={separador} value={separador}>
                              {SEPARADOR_NUMERO_PI_LABELS[separador]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
