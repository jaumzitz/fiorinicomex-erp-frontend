import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Kanban, LayoutGrid, Plus, Search, Table2 } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { ProcessoDrawer } from '@/components/ProcessoDrawer'
import { ModalIcon } from '@/components/ModalIcon'
import { ProcessosTable } from '@/components/processos/ProcessosTable'
import { ProcessosCards } from '@/components/processos/ProcessosCards'
import { ProcessosKanban } from '@/components/processos/ProcessosKanban'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { empresas } from '@/data/mock-data'
import { getCliente } from '@/lib/domain-queries'
import { normalizarNumeroPi } from '@/lib/numero-pi'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useProcessos } from '@/store/ProcessosContext'
import { MODAL_LABELS, PI_STATUSES, PI_STATUS_LABELS, type Modal } from '@/types/domain'

const CHAVE_VISUALIZACAO = 'fiorini-comex:visualizacao-processos'

type Visualizacao = 'tabela' | 'cards' | 'kanban'

const OPCOES_VISUALIZACAO: { id: Visualizacao; label: string; icon: typeof Table2 }[] = [
  { id: 'tabela', label: 'Tabela', icon: Table2 },
  { id: 'cards', label: 'Cards', icon: LayoutGrid },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
]

function visualizacaoInicial(): Visualizacao {
  const salvo = localStorage.getItem(CHAVE_VISUALIZACAO)
  return salvo === 'tabela' || salvo === 'cards' || salvo === 'kanban' ? salvo : 'tabela'
}

const clientes = empresas.filter((e) => e.tiposRelacionamento.includes('cliente'))

export default function ProcessosImportacao() {
  const { processos, criarProcesso } = useProcessos()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [searchParams, setSearchParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [clienteFiltro, setClienteFiltro] = useState<string>('todos')
  const [novoAberto, setNovoAberto] = useState(false)
  const [novoClienteId, setNovoClienteId] = useState('')
  const [novoModal, setNovoModal] = useState<Modal | ''>('')
  const [visualizacao, setVisualizacao] = useState<Visualizacao>(visualizacaoInicial)

  useEffect(() => {
    localStorage.setItem(CHAVE_VISUALIZACAO, visualizacao)
  }, [visualizacao])

  const visualizacaoEfetiva: Visualizacao = isDesktop ? visualizacao : 'cards'

  // O processo aberto no drawer vive na URL (?pi=<número>), não em estado
  // local — é o que permite "abrir em nova aba" (ctrl/cmd+clique ou menu de
  // contexto) apontar para uma URL de verdade. Usa o número do PI (não o
  // uuid interno) porque é o identificador visível/estável do processo; a
  // busca por número aceita ambos os formatos (com/sem hífen), então o
  // parâmetro também aceita.
  const numeroSelecionado = searchParams.get('pi')
  const drawerAberto = numeroSelecionado !== null
  const selecionado = numeroSelecionado
    ? (processos.find(
        (p) => normalizarNumeroPi(p.numero) === normalizarNumeroPi(numeroSelecionado),
      ) ?? null)
    : null

  const clientesUnicos = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of processos) {
      const cliente = getCliente(p.clienteId)
      if (cliente) map.set(cliente.id, cliente.nomeFantasia)
    }
    return [...map.entries()]
  }, [processos])

  const processosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const termoNumero = normalizarNumeroPi(busca.trim())
    return processos.filter((p) => {
      const cliente = getCliente(p.clienteId)
      const combinaTermo =
        termo === '' ||
        p.numero.toLowerCase().includes(termo) ||
        (termoNumero !== '' && normalizarNumeroPi(p.numero).includes(termoNumero)) ||
        cliente?.nomeFantasia.toLowerCase().includes(termo)
      const combinaStatus = statusFiltro === 'todos' || p.status === statusFiltro
      const combinaCliente = clienteFiltro === 'todos' || p.clienteId === clienteFiltro
      return combinaTermo && combinaStatus && combinaCliente
    })
  }, [processos, busca, statusFiltro, clienteFiltro])

  function abrirProcesso(id: string) {
    const processo = processos.find((p) => p.id === id)
    if (!processo) return
    setSearchParams((atual) => {
      const novo = new URLSearchParams(atual)
      novo.set('pi', processo.numero)
      return novo
    })
  }

  function abrirProcessoNovaAba(id: string) {
    const processo = processos.find((p) => p.id === id)
    if (!processo) return
    const url = new URL(window.location.href)
    url.searchParams.set('pi', processo.numero)
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  function fecharDrawer(aberto: boolean) {
    if (aberto) return
    setSearchParams((atual) => {
      const novo = new URLSearchParams(atual)
      novo.delete('pi')
      return novo
    })
  }

  function criar() {
    if (!novoClienteId || !novoModal) return
    const novo = criarProcesso({ clienteId: novoClienteId, modal: novoModal })
    setNovoAberto(false)
    setNovoClienteId('')
    setNovoModal('')
    abrirProcesso(novo.id)
  }

  return (
    <div>
      <PageHeader
        title="Processos de Importação"
        description={`${processosFiltrados.length} de ${processos.length} processos`}
        actions={
          <Button size="sm" onClick={() => setNovoAberto(true)}>
            <Plus className="size-4" />
            Novo Processo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-8">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nº do PI ou cliente"
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estágios</SelectItem>
              {PI_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {PI_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os clientes</SelectItem>
              {clientesUnicos.map(([id, nome]) => (
                <SelectItem key={id} value={id}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isDesktop && (
          <div className="bg-muted inline-flex items-center gap-0.5 self-start rounded-md p-0.5 sm:ml-auto">
            {OPCOES_VISUALIZACAO.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setVisualizacao(op.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors',
                  visualizacao === op.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <op.icon className="size-4" />
                {op.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-8 sm:px-8">
        {visualizacaoEfetiva === 'tabela' && (
          <ProcessosTable
            processos={processosFiltrados}
            onSelecionar={abrirProcesso}
            onAbrirNovaAba={abrirProcessoNovaAba}
          />
        )}
        {visualizacaoEfetiva === 'cards' && (
          <ProcessosCards
            processos={processosFiltrados}
            onSelecionar={abrirProcesso}
            onAbrirNovaAba={abrirProcessoNovaAba}
          />
        )}
        {visualizacaoEfetiva === 'kanban' && (
          <ProcessosKanban
            processos={processosFiltrados}
            onSelecionar={abrirProcesso}
            onAbrirNovaAba={abrirProcessoNovaAba}
          />
        )}
      </div>

      <Dialog open={novoAberto} onOpenChange={setNovoAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Processo de Importação</DialogTitle>
            <DialogDescription>
              O número do PI é gerado automaticamente. Os demais dados podem ser
              preenchidos em seguida, no drawer do processo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-cliente">Cliente</Label>
              <Select value={novoClienteId} onValueChange={setNovoClienteId}>
                <SelectTrigger id="novo-cliente" className="w-full">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nomeFantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-modal">Modal</Label>
              <Select
                value={novoModal}
                onValueChange={(v) => setNovoModal(v as Modal)}
              >
                <SelectTrigger id="novo-modal" className="w-full">
                  <SelectValue placeholder="Selecione o modal" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODAL_LABELS).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>
                      <span className="inline-flex items-center gap-1.5">
                        <ModalIcon modal={valor as Modal} className="size-4" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={criar} disabled={!novoClienteId || !novoModal}>
              Criar processo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProcessoDrawer
        processo={selecionado}
        open={drawerAberto}
        onOpenChange={fecharDrawer}
      />
    </div>
  )
}
