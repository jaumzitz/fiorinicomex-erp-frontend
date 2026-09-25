import { Plus, Users, X } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EditableField } from '@/components/EditableField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useEmpresasCadastradas } from '@/store/EmpresasCadastradasContext'
import {
  TIPOS_RELACIONAMENTO_EMPRESA,
  TIPO_RELACIONAMENTO_EMPRESA_LABELS,
  type Empresa,
  type TipoRelacionamentoEmpresa,
} from '@/types/domain'

export function EmpresaDrawer({
  empresa,
  open,
  onOpenChange,
}: {
  empresa: Empresa | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    atualizarEmpresa,
    alternarAtivoEmpresa,
    adicionarContato,
    atualizarContato,
    inativarContato,
  } = useEmpresasCadastradas()

  if (!empresa) return null

  function patch(campo: keyof Empresa, valor: string) {
    atualizarEmpresa(empresa!.id, { [campo]: valor })
  }

  function alternarTipoRelacionamento(tipo: TipoRelacionamentoEmpresa, marcado: boolean) {
    const atual = empresa!.tiposRelacionamento
    const proximo = marcado ? [...atual, tipo] : atual.filter((t) => t !== tipo)
    atualizarEmpresa(empresa!.id, { tiposRelacionamento: proximo })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl" showCloseButton={false}>
        <SheetHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-1 size-7 shrink-0"
            title="Fechar"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-lg">{empresa.nomeFantasia || 'Nova empresa'}</SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant={empresa.ativo ? 'default' : 'outline'} className="text-xs">
                {empresa.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alternarAtivoEmpresa(empresa.id)}
              >
                {empresa.ativo ? 'Inativar' : 'Ativar'}
              </Button>
            </div>
          </div>
          <SheetDescription>{empresa.razaoSocial}</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <Label className="text-muted-foreground text-xs font-normal">
            Tipo de relacionamento
          </Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {TIPOS_RELACIONAMENTO_EMPRESA.map((tipo) => (
              <label key={tipo} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={empresa.tiposRelacionamento.includes(tipo)}
                  onCheckedChange={(v) => alternarTipoRelacionamento(tipo, !!v)}
                />
                {TIPO_RELACIONAMENTO_EMPRESA_LABELS[tipo]}
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
          <EditableField
            label="Nome fantasia"
            value={empresa.nomeFantasia}
            onChange={(v) => patch('nomeFantasia', v)}
          />
          <EditableField
            label="Razão social"
            value={empresa.razaoSocial}
            onChange={(v) => patch('razaoSocial', v)}
          />
          <div className="col-span-2 flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs font-normal">Empresa estrangeira</Label>
            <div className="flex h-8 items-center gap-2">
              <Switch
                checked={empresa.estrangeira}
                onCheckedChange={(v) => atualizarEmpresa(empresa.id, { estrangeira: v })}
              />
              <span className="text-sm">{empresa.estrangeira ? 'Estrangeira' : 'Nacional'}</span>
            </div>
          </div>
          {empresa.estrangeira ? (
            <>
              <EditableField
                label="Tax ID"
                value={empresa.taxId ?? ''}
                onChange={(v) => patch('taxId', v)}
              />
              <EditableField
                label="País"
                value={empresa.pais ?? ''}
                onChange={(v) => patch('pais', v)}
              />
            </>
          ) : (
            <EditableField
              label="CNPJ"
              value={empresa.cnpj ?? ''}
              onChange={(v) => patch('cnpj', v)}
            />
          )}
          <EditableField
            label="Site"
            type="url"
            value={empresa.site ?? ''}
            onChange={(v) => patch('site', v)}
          />
          <EditableField
            label="Telefone"
            type="tel"
            value={empresa.telefone ?? ''}
            onChange={(v) => patch('telefone', v)}
          />
          <EditableField
            label="E-mail"
            type="email"
            value={empresa.email ?? ''}
            onChange={(v) => patch('email', v)}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4" />
              Contatos
              <Badge variant="secondary">{empresa.contatos.filter((c) => c.ativo).length}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => adicionarContato(empresa.id)}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>

          {empresa.contatos.filter((c) => c.ativo).length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum contato cadastrado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {empresa.contatos.filter((c) => c.ativo).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    placeholder="Nome"
                    value={c.nome}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { nome: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Input
                    placeholder="Telefone"
                    value={c.telefone ?? ''}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { telefone: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Input
                    placeholder="E-mail"
                    value={c.email ?? ''}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { email: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Inativar contato"
                    className="size-8 shrink-0"
                    onClick={() => inativarContato(empresa.id, c.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
