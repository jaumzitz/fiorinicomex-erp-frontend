import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Campo } from '@/components/admin/Campo'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import type { EmpresaConfig } from '@/types/domain'

export default function AdminEmpresa() {
  const { empresa, atualizarEmpresa } = useEmpresaConfig()

  function campo(chave: keyof EmpresaConfig) {
    return (valor: string) => atualizarEmpresa({ [chave]: valor })
  }

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Administração', to: '/admin' }, { label: 'Dados da empresa' }]}
          />
        }
        title="Dados da empresa"
        description="Informações institucionais da Fiorini Comex"
      />

      <div className="px-4 py-6 sm:px-8">
        <Card>
          <CardContent>
            <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo id="nome-empresa" label="Nome" value={empresa.nome} onChange={campo('nome')} />
              <Campo
                id="cnpj-empresa"
                label="CNPJ"
                value={empresa.cnpj}
                placeholder="00.000.000/0001-00"
                onChange={campo('cnpj')}
              />
              <Campo
                id="responsavel-empresa"
                label="Responsável"
                value={empresa.responsavel}
                onChange={campo('responsavel')}
              />
              <Campo
                id="telefone-empresa"
                label="Telefone"
                value={empresa.telefone}
                onChange={campo('telefone')}
              />
              <div className="sm:col-span-2">
                <Campo
                  id="endereco-empresa"
                  label="Endereço"
                  value={empresa.endereco}
                  onChange={campo('endereco')}
                />
              </div>
              <div className="sm:col-span-2">
                <Campo id="email-empresa" label="E-mail" value={empresa.email} onChange={campo('email')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
