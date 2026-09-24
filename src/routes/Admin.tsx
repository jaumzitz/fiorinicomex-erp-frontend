import { Building2, ChevronRight, Image, Landmark, Receipt, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

const SECOES_ADMIN: { to: string; icon: LucideIcon; titulo: string; descricao: string }[] = [
  {
    to: '/admin/empresa',
    icon: Building2,
    titulo: 'Dados da empresa',
    descricao: 'Nome, CNPJ, responsável, telefone e endereço',
  },
  {
    to: '/admin/pagamento',
    icon: Landmark,
    titulo: 'Dados para pagamento',
    descricao: 'Razão social e dados bancários exibidos no Numerário',
  },
  {
    to: '/admin/identidade',
    icon: Image,
    titulo: 'Identidade visual',
    descricao: 'Logo horizontal e ícone usados no sistema',
  },
  {
    to: '/admin/tributos',
    icon: Receipt,
    titulo: 'Tributos e despesas',
    descricao: 'Catálogo compartilhado usado no numerário dos processos',
  },
  {
    to: '/admin/usuarios',
    icon: Users,
    titulo: 'Usuários',
    descricao: 'Quem tem acesso ao sistema',
  },
]

export default function Admin() {
  return (
    <div>
      <PageHeader
        title="Administração"
        description="Configurações da empresa, identidade e usuários"
      />

      <div className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-8">
        {SECOES_ADMIN.map((secao) => (
          <Link key={secao.to} to={secao.to}>
            <Card className="h-full transition-colors hover:bg-accent/40">
              <CardContent className="flex items-start gap-4">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                  <secao.icon className="size-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium">{secao.titulo}</span>
                  <span className="text-muted-foreground text-sm">{secao.descricao}</span>
                </div>
                <ChevronRight className="text-muted-foreground size-4 shrink-0 self-center" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
