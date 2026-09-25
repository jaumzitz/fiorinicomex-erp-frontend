import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  voltarTo,
}: {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: ReactNode
  /** Quando definido, mostra um botão de voltar (seta) que navega para essa rota. */
  voltarTo?: string
}) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
      <div className="flex items-start gap-2">
        {voltarTo && (
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-2 size-8 shrink-0"
          >
            <Link to={voltarTo} aria-label="Voltar">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
        <div>
          {breadcrumb && <div className="mb-1.5">{breadcrumb}</div>}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
