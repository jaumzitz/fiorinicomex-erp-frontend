import { NavLink } from 'react-router-dom'
import { BarChart3, Building2, LayoutDashboard, Ship } from 'lucide-react'

import { cn } from '@/lib/utils'

const ITENS_TAB_BAR = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/processos', label: 'Processos', icon: Ship, end: false },
  { to: '/bi', label: 'BI', icon: BarChart3, end: false },
  { to: '/empresas', label: 'Empresas', icon: Building2, end: false },
] as const

export function MobileTabBar() {
  return (
    <nav className="bg-sidebar border-sidebar-border flex h-14 shrink-0 border-t lg:hidden">
      {ITENS_TAB_BAR.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon className="size-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
