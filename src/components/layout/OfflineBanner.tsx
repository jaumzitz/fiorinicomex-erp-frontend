import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div className="flex h-8 shrink-0 items-center justify-center gap-1.5 bg-amber-500 text-xs font-medium text-amber-950">
      <WifiOff className="size-3.5" />
      Você está offline. Alguns dados podem estar desatualizados.
    </div>
  )
}
