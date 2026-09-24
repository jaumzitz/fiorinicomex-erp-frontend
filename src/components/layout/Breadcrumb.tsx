import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, indice) => {
        const ultimo = indice === items.length - 1
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {indice > 0 && (
              <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
            )}
            {item.to && !ultimo ? (
              <Link
                to={item.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={ultimo ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
