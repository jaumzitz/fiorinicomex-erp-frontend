import { createContext, useContext, useState, type ReactNode } from 'react'

import { preferenciasSistemaPadrao } from '@/data/mock-data'
import { formatarNumeroPi } from '@/lib/numero-pi'
import type { PreferenciasSistema } from '@/types/domain'

interface PreferenciasContextValue {
  preferencias: PreferenciasSistema
  atualizarPreferencias: (patch: Partial<PreferenciasSistema>) => void
}

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null)

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<PreferenciasSistema>(preferenciasSistemaPadrao)

  function atualizarPreferencias(patch: Partial<PreferenciasSistema>) {
    setPreferencias((atual) => ({ ...atual, ...patch }))
  }

  return (
    <PreferenciasContext.Provider value={{ preferencias, atualizarPreferencias }}>
      {children}
    </PreferenciasContext.Provider>
  )
}

export function usePreferencias() {
  const ctx = useContext(PreferenciasContext)
  if (!ctx) throw new Error('usePreferencias deve ser usado dentro de PreferenciasProvider')
  return ctx
}

/** Atalho para formatar um número de PI já usando a preferência atual do sistema. */
export function useFormatarNumeroPi() {
  const { preferencias } = usePreferencias()
  return (numero: string) => formatarNumeroPi(numero, preferencias.separadorNumeroPi)
}
