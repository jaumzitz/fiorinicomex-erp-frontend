import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { CampoImagem } from '@/components/admin/CampoImagem'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'

export default function AdminIdentidade() {
  const { empresa, atualizarEmpresa } = useEmpresaConfig()

  return (
    <div>
      <PageHeader
        voltarTo="/admin"
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Administração', to: '/admin' }, { label: 'Identidade visual' }]}
          />
        }
        title="Identidade visual"
        description="Logo e ícone usados no sistema e nos documentos gerados"
      />

      <div className="px-4 py-6 sm:px-8">
        <Card>
          <CardContent>
            <div className="flex max-w-lg flex-col gap-5">
              <CampoImagem
                label="Logo horizontal"
                descricao="Usado no cabeçalho do Numerário e em outros documentos gerados."
                url={empresa.logoHorizontalUrl}
                onSelecionar={(file) =>
                  atualizarEmpresa({ logoHorizontalUrl: URL.createObjectURL(file) })
                }
              />
              <CampoImagem
                label="Ícone"
                descricao="Usado no menu lateral e como favicon do sistema."
                url={empresa.iconeUrl}
                onSelecionar={(file) => atualizarEmpresa({ iconeUrl: URL.createObjectURL(file) })}
              />
              <p className="text-muted-foreground text-xs">
                Upload local por enquanto — o armazenamento real das imagens entra
                quando o back-end (Supabase Storage) for integrado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
