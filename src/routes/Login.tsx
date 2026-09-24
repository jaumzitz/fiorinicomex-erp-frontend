import { useState, type FormEvent } from 'react'
import { Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import loginNavio from '@/assets/login-navio.jpg'

export default function Login() {
  const { empresa } = useEmpresaConfig()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)

  function entrar(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center lg:hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${loginNavio})`,
        }}
      />

      <div
        className="relative hidden flex-col justify-end p-10 text-white lg:flex"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1) 60%), url(${loginNavio})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
            <Package className="size-4.5" />
          </div>
          <span className="text-lg font-semibold">{empresa.nome}</span>
        </div>
        <blockquote className="mt-6 max-w-md text-sm text-white/80">
          Gestão completa de processos de importação, do embarque ao desembaraço.
        </blockquote>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-white lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
              <Package className="size-5" />
            </div>
            <span className="text-lg font-semibold">{empresa.nome}</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Entrar no Netuno ERP</CardTitle>
              <CardDescription>Acesse com seu e-mail e senha para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={entrar} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@fiorinicomex.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha">Senha</Label>
                    <button
                      type="button"
                      className="text-muted-foreground text-xs hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={lembrar}
                    onCheckedChange={(v) => setLembrar(v === true)}
                  />
                  Lembrar de mim
                </label>

                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
