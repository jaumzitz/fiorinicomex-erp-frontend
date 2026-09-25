import { useState } from 'react'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { SidebarBrand, SidebarNav, SidebarUserCard } from '@/components/layout/Sidebar'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'

export function MobileTopBar() {
  const { empresa } = useEmpresaConfig()
  const [aberto, setAberto] = useState(false)

  return (
    <header className="bg-sidebar border-sidebar-border sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b px-3 lg:hidden">
      <Button size="icon" variant="ghost" onClick={() => setAberto(true)}>
        <Menu className="size-5" />
      </Button>
      <span className="text-sm font-semibold">{empresa.nome}</span>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent
          side="left"
          closeButtonPosition="left"
          className="w-72 gap-0 p-0"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="pt-10">
            <SidebarBrand />
          </div>
          <SidebarNav onNavigate={() => setAberto(false)} />
          <SidebarUserCard />
        </SheetContent>
      </Sheet>
    </header>
  )
}
