import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Ship,
  Building2,
  BarChart3,
  Settings,
  Package,
  LogOut,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const USUARIO_LOGADO = { nome: 'Fiorini', email: 'fiorini@fiorinicomex.com.br' }

export const navItems = [
  { to: '/', label: 'Boas-vindas', icon: LayoutDashboard, end: true },
  { to: '/processos', label: 'Processos de Importação', icon: Ship },
  { to: '/empresas', label: 'Cadastro de Empresas', icon: Building2 },
  { to: '/bi', label: 'BI', icon: BarChart3 },
  { to: '/admin', label: 'Administração', icon: Settings },
]

export function SidebarBrand() {
  const { empresa } = useEmpresaConfig()

  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {empresa.iconeUrl ? (
          <img src={empresa.iconeUrl} alt="" className="size-full object-cover" />
        ) : (
          <Package className="size-4.5" />
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{empresa.nome}</span>
        <span className="text-muted-foreground text-xs">Gestão de Importação</span>
      </div>
    </div>
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarUserCard() {
  const navigate = useNavigate()
  const iniciais = USUARIO_LOGADO.nome.slice(0, 2).toUpperCase()

  return (
    <div className="mt-auto p-3">
      <Card className="flex-row items-center gap-2 p-3 shadow-xs">
        <Avatar className="size-8">
          <AvatarFallback>{iniciais}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{USUARIO_LOGADO.nome}</span>
          <span className="text-muted-foreground truncate text-xs">
            {USUARIO_LOGADO.email}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          title="Sair"
          onClick={() => navigate('/login')}
        >
          <LogOut className="size-4" />
        </Button>
      </Card>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden h-svh w-64 shrink-0 flex-col border-r lg:flex">
      <SidebarBrand />
      <SidebarNav />
      <SidebarUserCard />
    </aside>
  )
}
