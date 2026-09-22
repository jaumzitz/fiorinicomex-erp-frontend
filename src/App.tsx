import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProcessosProvider } from '@/store/ProcessosContext'
import { EmpresaConfigProvider } from '@/store/EmpresaConfigContext'
import { EmpresasCadastradasProvider } from '@/store/EmpresasCadastradasContext'
import { TributosCatalogoProvider } from '@/store/TributosCatalogoContext'
import Welcome from '@/routes/Welcome'
import ProcessosImportacao from '@/routes/ProcessosImportacao'
import EmpresasCadastro from '@/routes/EmpresasCadastro'
import BI from '@/routes/BI'
import Admin from '@/routes/Admin'
import Login from '@/routes/Login'

function App() {
  return (
    <EmpresaConfigProvider>
      <ProcessosProvider>
        <EmpresasCadastradasProvider>
          <TributosCatalogoProvider>
            <BrowserRouter>
              <Routes>
                <Route path="login" element={<Login />} />
                <Route element={<AppLayout />}>
                  <Route index element={<Welcome />} />
                  <Route path="processos" element={<ProcessosImportacao />} />
                  <Route path="empresas" element={<EmpresasCadastro />} />
                  <Route path="bi" element={<BI />} />
                  <Route path="admin" element={<Admin />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TributosCatalogoProvider>
        </EmpresasCadastradasProvider>
      </ProcessosProvider>
    </EmpresaConfigProvider>
  )
}

export default App
