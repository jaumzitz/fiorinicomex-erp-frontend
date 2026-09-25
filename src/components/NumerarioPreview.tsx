import { Package } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { getCliente } from '@/lib/domain-queries'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import { useEmpresasCadastradas } from '@/store/EmpresasCadastradasContext'
import { useFormatarNumeroPi } from '@/store/PreferenciasContext'
import type { ProcessoImportacao } from '@/types/domain'

function formatMoeda(valor: number) {
  if (valor === 0) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function NumerarioPreview({ processo }: { processo: ProcessoImportacao }) {
  const { empresa } = useEmpresaConfig()
  const { empresas } = useEmpresasCadastradas()
  const formatarPi = useFormatarNumeroPi()
  const numerario = processo.numerario
  if (!numerario) return null

  const cliente = getCliente(processo.clienteId)
  const exportador = empresas.find((e) => e.id === processo.exportadorId)
  const total = numerario.tributos.reduce((soma, item) => soma + item.valor, 0)

  return (
    <div className="rounded-md border bg-white p-6 text-sm text-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {empresa.logoHorizontalUrl ? (
            <img src={empresa.logoHorizontalUrl} alt={empresa.nome} className="h-9" />
          ) : (
            <>
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
                {empresa.iconeUrl ? (
                  <img src={empresa.iconeUrl} alt="" className="size-9 rounded-md object-cover" />
                ) : (
                  <Package className="size-5" />
                )}
              </div>
              <div>
                <div className="font-semibold">{empresa.nome}</div>
              </div>
            </>
          )}
        </div>
        <div className="text-right text-xs text-neutral-600">
          <div className="font-medium">{empresa.razaoSocial.toUpperCase()}</div>
          {empresa.endereco && <div>{empresa.endereco}</div>}
        </div>
      </div>

      <h2 className="mt-4 text-center text-base font-semibold tracking-wide">
        NUMERÁRIO — {formatarPi(processo.numero)}
      </h2>

      <Separator className="my-4" />

      <div className="bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white uppercase">
        Informações do processo
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-t-0 p-3">
        <div>
          <span className="text-muted-foreground">Cliente: </span>
          {cliente?.nomeFantasia}
        </div>
        <div>
          <span className="text-muted-foreground">Produto: </span>
          {processo.produtos.map((produto) => produto.nome).join(', ') || '—'}
        </div>
        <div>
          <span className="text-muted-foreground">Invoice: </span>
          {numerario.invoice}
        </div>
        <div>
          <span className="text-muted-foreground">Exportador: </span>
          {exportador?.nomeFantasia || '—'}
        </div>
        <div>
          <span className="text-muted-foreground">Cotação moeda: </span>
          {numerario.cotacaoMoeda.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      </div>

      <div className="mt-4 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white uppercase">
        Tributos / Despesas
      </div>
      <div className="border border-t-0">
        {numerario.tributos.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b px-3 py-1.5 last:border-b-0"
          >
            <span>{item.descricao}</span>
            <span>{formatMoeda(item.valor)}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-2 border-neutral-900 px-3 py-2 font-semibold">
        <span>TOTAL SOLICITADO</span>
        <span>
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <div>
          <div className="font-semibold">Dados Bancários:</div>
          <div>{empresa.dadosBancarios.banco}</div>
          <div>Ag: {empresa.dadosBancarios.agencia}</div>
          <div>Conta: {empresa.dadosBancarios.conta}</div>
          <div>PIX: {empresa.dadosBancarios.pix}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold italic">{empresa.razaoSocial}</div>
        </div>
      </div>
    </div>
  )
}
