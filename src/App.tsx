import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProcessosProvider } from '@/store/ProcessosContext'
import { EmpresaConfigProvider } from '@/store/EmpresaConfigContext'
import { EmpresasCadastradasProvider } from '@/store/EmpresasCadastradasContext'
import { TributosCatalogoProvider } from '@/store/TributosCatalogoContext'
import { UsuariosProvider } from '@/store/UsuariosContext'
import Welcome from '@/routes/Welcome'
import ProcessosImportacao from '@/routes/ProcessosImportacao'
import EmpresasCadastro from '@/routes/EmpresasCadastro'
import BI from '@/routes/BI'
import Admin from '@/routes/Admin'
import AdminEmpresa from '@/routes/admin/AdminEmpresa'
import AdminPagamento from '@/routes/admin/AdminPagamento'
import AdminIdentidade from '@/routes/admin/AdminIdentidade'
import AdminTributos from '@/routes/admin/AdminTributos'
import AdminUsuarios from '@/routes/admin/AdminUsuarios'
import Login from '@/routes/Login'

function App() {
  return (
    <EmpresaConfigProvider>
      <ProcessosProvider>
        <EmpresasCadastradasProvider>
          <TributosCatalogoProvider>
            <UsuariosProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="login" element={<Login />} />
                  <Route element={<AppLayout />}>
                    <Route index element={<Welcome />} />
                    <Route path="processos" element={<ProcessosImportacao />} />
                    <Route path="empresas" element={<EmpresasCadastro />} />
                    <Route path="bi" element={<BI />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="admin/empresa" element={<AdminEmpresa />} />
                    <Route path="admin/pagamento" element={<AdminPagamento />} />
                    <Route path="admin/identidade" element={<AdminIdentidade />} />
                    <Route path="admin/tributos" element={<AdminTributos />} />
                    <Route path="admin/usuarios" element={<AdminUsuarios />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </UsuariosProvider>
          </TributosCatalogoProvider>
        </EmpresasCadastradasProvider>
      </ProcessosProvider>
    </EmpresaConfigProvider>
  )
}

export default App
