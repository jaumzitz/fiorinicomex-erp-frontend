import type { SeparadorNumeroPi } from '@/types/domain'

/**
 * Formata o número do PI para exibição de acordo com a preferência do
 * sistema. O armazenamento interno (`processo.numero`) é sempre "PI-{n}" —
 * isso é só uma transformação de exibição, nunca muda o dado salvo.
 */
export function formatarNumeroPi(numero: string, separador: SeparadorNumeroPi): string {
  const digitos = numero.replace(/\D/g, '')
  return separador === 'hifen' ? `PI-${digitos}` : `PI${digitos}`
}

/**
 * Normaliza um número de PI (ou um termo de busca) removendo hífen/espaços
 * e caixa, para que "PI-123", "pi123" e "123" comparem como equivalentes
 * independente do separador configurado.
 */
export function normalizarNumeroPi(valor: string): string {
  return valor.toUpperCase().replace(/[\s-]/g, '')
}
