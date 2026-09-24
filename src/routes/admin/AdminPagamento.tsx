import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Campo } from '@/components/admin/Campo'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import type { EmpresaConfig } from '@/types/domain'

export default function AdminPagamento() {
  const { empresa, atualizarEmpresa } = useEmpresaConfig()

  function campo(chave: keyof EmpresaConfig) {
    return (valor: string) => atualizarEmpresa({ [chave]: valor })
  }

  function campoBancario(chave: keyof EmpresaConfig['dadosBancarios']) {
    return (valor: string) =>
      atualizarEmpresa({ dadosBancarios: { ...empresa.dadosBancarios, [chave]: valor } })
  }

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Administração', to: '/admin' }, { label: 'Dados para pagamento' }]}
          />
        }
        title="Dados para pagamento"
        description="Exibidos no cabeçalho e rodapé do Numerário"
      />

      <div className="px-4 py-6 sm:px-8">
        <Card>
          <CardContent>
            <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo
                  id="razao-social"
                  label="Razão social"
                  value={empresa.razaoSocial}
                  onChange={campo('razaoSocial')}
                />
              </div>
              <Campo
                id="banco"
                label="Banco"
                value={empresa.dadosBancarios.banco}
                onChange={campoBancario('banco')}
              />
              <Campo
                id="agencia"
                label="Agência"
                value={empresa.dadosBancarios.agencia}
                onChange={campoBancario('agencia')}
              />
              <Campo
                id="conta"
                label="Conta corrente"
                value={empresa.dadosBancarios.conta}
                onChange={campoBancario('conta')}
              />
              <Campo
                id="pix"
                label="PIX"
                value={empresa.dadosBancarios.pix}
                onChange={campoBancario('pix')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
