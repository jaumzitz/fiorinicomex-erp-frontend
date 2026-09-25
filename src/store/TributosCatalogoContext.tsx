import { createContext, useContext, useState, type ReactNode } from 'react'

import { TRIBUTOS_CATALOGO_PADRAO } from '@/data/mock-data'
import type { TributoCatalogo } from '@/types/domain'

interface TributosCatalogoContextValue {
  tributosCatalogo: TributoCatalogo[]
  adicionarTributoCatalogo: (nome: string) => void
  alternarAtivoTributoCatalogo: (nome: string) => void
  alternarPadraoTributoCatalogo: (nome: string) => void
}

const TributosCatalogoContext = createContext<TributosCatalogoContextValue | null>(null)

export function TributosCatalogoProvider({ children }: { children: ReactNode }) {
  const [tributosCatalogo, setTributosCatalogo] =
    useState<TributoCatalogo[]>(TRIBUTOS_CATALOGO_PADRAO)

  function adicionarTributoCatalogo(nome: string) {
    const valor = nome.trim()
    if (!valor) return
    setTributosCatalogo((atual) => {
      const existente = atual.find((t) => t.nome.toLowerCase() === valor.toLowerCase())
      if (existente) {
        return existente.ativo
          ? atual
          : atual.map((t) => (t === existente ? { ...t, ativo: true } : t))
      }
      return [...atual, { nome: valor, ativo: true, padrao: false }]
    })
  }

  function alternarAtivoTributoCatalogo(nome: string) {
    setTributosCatalogo((atual) =>
      atual.map((t) => (t.nome === nome ? { ...t, ativo: !t.ativo } : t)),
    )
  }

  function alternarPadraoTributoCatalogo(nome: string) {
    setTributosCatalogo((atual) =>
      atual.map((t) => (t.nome === nome ? { ...t, padrao: !t.padrao } : t)),
    )
  }

  return (
    <TributosCatalogoContext.Provider
      value={{
        tributosCatalogo,
        adicionarTributoCatalogo,
        alternarAtivoTributoCatalogo,
        alternarPadraoTributoCatalogo,
      }}
    >
      {children}
    </TributosCatalogoContext.Provider>
  )
}

export function useTributosCatalogo() {
  const ctx = useContext(TributosCatalogoContext)
  if (!ctx) {
    throw new Error('useTributosCatalogo deve ser usado dentro de TributosCatalogoProvider')
  }
  return ctx
}
