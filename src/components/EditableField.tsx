import { Calendar } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function EditableField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date' | 'email' | 'tel' | 'url'
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label className="text-muted-foreground truncate text-xs font-normal">{label}</Label>
      <div className="relative min-w-0">
        {type === 'date' && (
          <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        )}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-8',
            // appearance-none é o que faz o input[type=date] do iOS Safari
            // respeitar a largura do container em vez de usar a intrínseca.
            type === 'date' &&
              "appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0",
            type === 'date' && !value && 'text-muted-foreground',
          )}
        />
      </div>
    </div>
  )
}
