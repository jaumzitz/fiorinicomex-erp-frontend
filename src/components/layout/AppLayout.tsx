import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { OfflineBanner } from '@/components/layout/OfflineBanner'

export function AppLayout() {
  return (
    <div className="flex h-svh w-full flex-col overflow-hidden">
      <OfflineBanner />
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </main>
          <MobileTabBar />
        </div>
      </div>
    </div>
  )
}
