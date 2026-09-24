import { useRef } from 'react'
import { Upload } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function CampoImagem({
  label,
  descricao,
  url,
  onSelecionar,
}: {
  label: string
  descricao: string
  url?: string
  onSelecionar: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <p className="text-muted-foreground text-xs">{descricao}</p>
      <div className="flex items-center gap-3">
        <div className="bg-muted flex h-16 w-32 items-center justify-center overflow-hidden rounded-md border">
          {url ? (
            <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-muted-foreground text-xs">Sem imagem</span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          Enviar
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelecionar(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
