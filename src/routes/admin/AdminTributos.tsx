import { useState } from 'react'
import { Plus, Star } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useTributosCatalogo } from '@/store/TributosCatalogoContext'

const FILTROS_TRIBUTO = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativos', label: 'Ativos' },
  { id: 'inativos', label: 'Inativos' },
] as const

type FiltroTributo = (typeof FILTROS_TRIBUTO)[number]['id']

export default function AdminTributos() {
  const {
    tributosCatalogo,
    adicionarTributoCatalogo,
    alternarAtivoTributoCatalogo,
    alternarPadraoTributoCatalogo,
  } = useTributosCatalogo()
  const [novoTributo, setNovoTributo] = useState('')
  const [filtroTributo, setFiltroTributo] = useState<FiltroTributo>('todos')

  const tributosFiltrados = tributosCatalogo.filter((t) => {
    if (filtroTributo === 'ativos') return t.ativo
    if (filtroTributo === 'inativos') return !t.ativo
    return true
  })

  function adicionarTributoAtual() {
    const valor = novoTributo.trim()
    if (!valor) return
    adicionarTributoCatalogo(valor)
    setNovoTributo('')
  }

  return (
    <div>
      <PageHeader
        voltarTo="/admin"
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Administração', to: '/admin' }, { label: 'Tributos e despesas' }]}
          />
        }
        title="Tributos e despesas"
        description="Catálogo compartilhado usado no numerário dos processos"
      />

      <div className="px-4 py-6 sm:px-8">
        <Card>
          <CardContent>
            <div className="flex max-w-lg flex-col gap-4">
              <p className="text-muted-foreground text-xs">
                Itens disponíveis para seleção ao cadastrar tributos e despesas no
                numerário dos processos. Itens inativos deixam de aparecer para
                seleção, mas não são excluídos. Itens marcados como{' '}
                <span className="text-foreground font-medium">padrão</span> entram
                automaticamente em todo numerário novo.
              </p>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo tributo ou despesa..."
                  value={novoTributo}
                  onChange={(e) => setNovoTributo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      adicionarTributoAtual()
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={adicionarTributoAtual}
                  disabled={!novoTributo.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <Select value={filtroTributo} onValueChange={(v) => setFiltroTributo(v as FiltroTributo)}>
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTROS_TRIBUTO.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {tributosFiltrados.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum item encontrado.</p>
              ) : (
                <ul className="flex flex-col divide-y rounded-md border">
                  {tributosFiltrados.map((t) => (
                    <li
                      key={t.nome}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className={t.ativo ? '' : 'text-muted-foreground line-through'}>
                        {t.nome}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={t.ativo ? 'default' : 'outline'} className="text-xs">
                          {t.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant={t.padrao ? 'default' : 'outline'}
                          onClick={() => alternarPadraoTributoCatalogo(t.nome)}
                          title="Incluir automaticamente ao criar um novo numerário"
                        >
                          <Star className={cn('size-3.5', t.padrao && 'fill-current')} />
                          Padrão
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alternarAtivoTributoCatalogo(t.nome)}
                        >
                          {t.ativo ? 'Inativar' : 'Ativar'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
