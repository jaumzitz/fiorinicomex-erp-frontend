import { createContext, useContext, useState, type ReactNode } from 'react'

import { usuarios as usuariosIniciais } from '@/data/mock-data'
import { hoje } from '@/lib/date'
import type { Usuario } from '@/types/domain'

interface UsuariosContextValue {
  usuarios: Usuario[]
  criarUsuario: (dados: { nome: string; email: string; cargo?: string }) => Usuario
  atualizarUsuario: (id: string, patch: Partial<Usuario>) => void
  alternarAtivoUsuario: (id: string) => void
}

const UsuariosContext = createContext<UsuariosContextValue | null>(null)

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais)

  function criarUsuario(dados: { nome: string; email: string; cargo?: string }) {
    const novo: Usuario = {
      id: crypto.randomUUID(),
      criadoEm: hoje(),
      ativo: true,
      ...dados,
    }
    setUsuarios((atual) => [novo, ...atual])
    return novo
  }

  function atualizarUsuario(id: string, patch: Partial<Usuario>) {
    setUsuarios((atual) => atual.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  function alternarAtivoUsuario(id: string) {
    setUsuarios((atual) => atual.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)))
  }

  return (
    <UsuariosContext.Provider
      value={{ usuarios, criarUsuario, atualizarUsuario, alternarAtivoUsuario }}
    >
      {children}
    </UsuariosContext.Provider>
  )
}

export function useUsuarios() {
  const ctx = useContext(UsuariosContext)
  if (!ctx) throw new Error('useUsuarios deve ser usado dentro de UsuariosProvider')
  return ctx
}
