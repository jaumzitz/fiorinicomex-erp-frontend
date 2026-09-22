import { createContext, useContext, useState, type ReactNode } from 'react'

import { processos as processosIniciais } from '@/data/mock-data'
import { hoje } from '@/lib/date'
import type { Anexo, Comentario, PiStatus, ProcessoImportacao, Produto } from '@/types/domain'

interface ProcessosContextValue {
  processos: ProcessoImportacao[]
  criarProcesso: (dados: {
    clienteId: string
    modal: ProcessoImportacao['modal']
  }) => ProcessoImportacao
  atualizarProcesso: (id: string, patch: Partial<ProcessoImportacao>) => void
  alterarStatus: (id: string, status: PiStatus) => void
  adicionarComentario: (id: string, comentario: Omit<Comentario, 'id' | 'ativo'>) => void
  atualizarComentario: (id: string, comentarioId: string, patch: Partial<Comentario>) => void
  inativarComentario: (id: string, comentarioId: string) => void
  adicionarAnexos: (id: string, anexos: Array<Omit<Anexo, 'id'>>) => void
  atualizarAnexo: (id: string, anexoId: string, patch: Partial<Anexo>) => void
  removerAnexo: (id: string, anexoId: string) => void
  alternarFornecedorCotado: (id: string, fornecedorId: string) => void
  definirFornecedorAceito: (id: string, fornecedorId: string | undefined) => void
  adicionarProduto: (id: string, produto: Omit<Produto, 'id'>) => void
  atualizarProduto: (id: string, produtoId: string, patch: Partial<Produto>) => void
  removerProduto: (id: string, produtoId: string) => void
}

const ProcessosContext = createContext<ProcessosContextValue | null>(null)

function proximoNumero(processos: ProcessoImportacao[]) {
  const maior = processos.reduce((max, p) => {
    const n = parseInt(p.numero.replace('PI-', ''), 10)
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return `PI-${maior + 1}`
}

export function ProcessosProvider({ children }: { children: ReactNode }) {
  const [processos, setProcessos] = useState<ProcessoImportacao[]>(processosIniciais)

  function criarProcesso(dados: { clienteId: string; modal: ProcessoImportacao['modal'] }) {
    let novo!: ProcessoImportacao
    setProcessos((atual) => {
      novo = {
        id: crypto.randomUUID(),
        numero: proximoNumero(atual),
        clienteId: dados.clienteId,
        modal: dados.modal,
        status: 'aberto',
        produtos: [],
        criadoEm: hoje(),
        atualizadoEm: hoje(),
        comentarios: [],
        anexos: [],
      }
      return [novo, ...atual]
    })
    return novo
  }

  function atualizarProcesso(id: string, patch: Partial<ProcessoImportacao>) {
    setProcessos((atual) =>
      atual.map((p) => (p.id === id ? { ...p, ...patch, atualizadoEm: hoje() } : p)),
    )
  }

  function alterarStatus(id: string, status: PiStatus) {
    atualizarProcesso(id, { status })
  }

  function adicionarComentario(id: string, comentario: Omit<Comentario, 'id' | 'ativo'>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              comentarios: [
                ...p.comentarios,
                { ...comentario, id: crypto.randomUUID(), ativo: true },
              ],
              atualizadoEm: hoje(),
            }
          : p,
      ),
    )
  }

  function adicionarAnexos(id: string, anexos: Array<Omit<Anexo, 'id'>>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              anexos: [...p.anexos, ...anexos.map((a) => ({ ...a, id: crypto.randomUUID() }))],
              atualizadoEm: hoje(),
            }
          : p,
      ),
    )
  }

  function alternarFornecedorCotado(id: string, fornecedorId: string) {
    setProcessos((atual) =>
      atual.map((p) => {
        if (p.id !== id) return p
        const cotados = p.fornecedoresCotadosIds ?? []
        const jaCotado = cotados.includes(fornecedorId)
        const novosCotados = jaCotado
          ? cotados.filter((f) => f !== fornecedorId)
          : [...cotados, fornecedorId]
        const aindaAceito =
          jaCotado && p.fornecedorFreteId === fornecedorId ? undefined : p.fornecedorFreteId
        return {
          ...p,
          fornecedoresCotadosIds: novosCotados,
          fornecedorFreteId: aindaAceito,
          atualizadoEm: hoje(),
        }
      }),
    )
  }

  function definirFornecedorAceito(id: string, fornecedorId: string | undefined) {
    atualizarProcesso(id, { fornecedorFreteId: fornecedorId })
  }

  function atualizarComentario(id: string, comentarioId: string, patch: Partial<Comentario>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id === comentarioId ? { ...c, ...patch } : c,
              ),
            }
          : p,
      ),
    )
  }

  function inativarComentario(id: string, comentarioId: string) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id === comentarioId ? { ...c, ativo: false } : c,
              ),
            }
          : p,
      ),
    )
  }

  function atualizarAnexo(id: string, anexoId: string, patch: Partial<Anexo>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              anexos: p.anexos.map((a) => (a.id === anexoId ? { ...a, ...patch } : a)),
            }
          : p,
      ),
    )
  }

  function removerAnexo(id: string, anexoId: string) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? { ...p, anexos: p.anexos.filter((a) => a.id !== anexoId), atualizadoEm: hoje() }
          : p,
      ),
    )
  }

  function adicionarProduto(id: string, produto: Omit<Produto, 'id'>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              produtos: [...p.produtos, { ...produto, id: crypto.randomUUID() }],
              atualizadoEm: hoje(),
            }
          : p,
      ),
    )
  }

  function atualizarProduto(id: string, produtoId: string, patch: Partial<Produto>) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              produtos: p.produtos.map((item) =>
                item.id === produtoId ? { ...item, ...patch } : item,
              ),
            }
          : p,
      ),
    )
  }

  function removerProduto(id: string, produtoId: string) {
    setProcessos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              produtos: p.produtos.filter((item) => item.id !== produtoId),
              atualizadoEm: hoje(),
            }
          : p,
      ),
    )
  }

  return (
    <ProcessosContext.Provider
      value={{
        processos,
        criarProcesso,
        atualizarProcesso,
        alterarStatus,
        adicionarComentario,
        atualizarComentario,
        inativarComentario,
        adicionarAnexos,
        atualizarAnexo,
        removerAnexo,
        alternarFornecedorCotado,
        definirFornecedorAceito,
        adicionarProduto,
        atualizarProduto,
        removerProduto,
      }}
    >
      {children}
    </ProcessosContext.Provider>
  )
}

export function useProcessos() {
  const ctx = useContext(ProcessosContext)
  if (!ctx) throw new Error('useProcessos deve ser usado dentro de ProcessosProvider')
  return ctx
}
