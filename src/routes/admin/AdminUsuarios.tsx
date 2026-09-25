import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMediaQuery } from '@/hooks/use-media-query'
import { formatarData } from '@/lib/date'
import { useUsuarios } from '@/store/UsuariosContext'
import type { Usuario } from '@/types/domain'

const FILTROS_STATUS = [
  { id: 'ativos', label: 'Ativos' },
  { id: 'inativos', label: 'Inativos' },
  { id: 'todos', label: 'Todos' },
] as const

type FiltroStatus = (typeof FILTROS_STATUS)[number]['id']

export default function AdminUsuarios() {
  const { usuarios, criarUsuario, atualizarUsuario, alternarAtivoUsuario } = useUsuarios()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formNome, setFormNome] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formCargo, setFormCargo] = useState('')

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return usuarios.filter((u) => {
      if (filtroStatus === 'ativos' && !u.ativo) return false
      if (filtroStatus === 'inativos' && u.ativo) return false
      if (!termo) return true
      return (
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.cargo ?? '').toLowerCase().includes(termo)
      )
    })
  }, [usuarios, busca, filtroStatus])

  function abrirNovo() {
    setEditandoId(null)
    setFormNome('')
    setFormEmail('')
    setFormCargo('')
    setDialogAberto(true)
  }

  function abrirEdicao(usuario: Usuario) {
    setEditandoId(usuario.id)
    setFormNome(usuario.nome)
    setFormEmail(usuario.email)
    setFormCargo(usuario.cargo ?? '')
    setDialogAberto(true)
  }

  function salvar() {
    if (!formNome.trim() || !formEmail.trim()) return
    const dados = {
      nome: formNome.trim(),
      email: formEmail.trim(),
      cargo: formCargo.trim() || undefined,
    }
    if (editandoId) {
      atualizarUsuario(editandoId, dados)
    } else {
      criarUsuario(dados)
    }
    setDialogAberto(false)
  }

  return (
    <div>
      <PageHeader
        voltarTo="/admin"
        breadcrumb={
          <Breadcrumb items={[{ label: 'Administração', to: '/admin' }, { label: 'Usuários' }]} />
        }
        title="Usuários"
        description={`${usuariosFiltrados.length} de ${usuarios.length} usuários`}
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="size-4" />
            Novo usuário
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-8">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, e-mail ou cargo"
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as FiltroStatus)}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTROS_STATUS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 pb-8 sm:px-8">
        {isDesktop ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.cargo || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatarData(u.criadoEm)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.ativo ? 'default' : 'outline'} className="text-xs">
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => abrirEdicao(u)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alternarAtivoUsuario(u.id)}
                        >
                          {u.ativo ? 'Inativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {usuariosFiltrados.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{u.nome}</span>
                      <span className="text-muted-foreground text-sm">{u.email}</span>
                      {u.cargo && (
                        <span className="text-muted-foreground text-xs">{u.cargo}</span>
                      )}
                    </div>
                    <Badge variant={u.ativo ? 'default' : 'outline'} className="text-xs">
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => abrirEdicao(u)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => alternarAtivoUsuario(u.id)}
                    >
                      {u.ativo ? 'Inativar' : 'Ativar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {usuariosFiltrados.length === 0 && (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoId ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
            <DialogDescription>
              {editandoId
                ? 'Atualize os dados de acesso deste usuário.'
                : 'Cadastre um novo usuário com acesso ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="usuario-nome">Nome</Label>
              <Input
                id="usuario-nome"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="usuario-email">E-mail</Label>
              <Input
                id="usuario-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="usuario-cargo">Cargo</Label>
              <Input
                id="usuario-cargo"
                placeholder="Opcional"
                value={formCargo}
                onChange={(e) => setFormCargo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={!formNome.trim() || !formEmail.trim()}>
              {editandoId ? 'Salvar' : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
