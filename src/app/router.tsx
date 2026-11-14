import { createBrowserRouter, Navigate } from 'react-router-dom';

import { registerNavigationHandler } from '@/shared/config/session-handler';
import { RUTAS } from '@/shared/constants/constants';

import MainLayout from './layouts/main-layout';
import PublicLayout from './layouts/public-layout';
import AuditoriaRoute from './routes/auditoria';
import CambiarClaveRoute from './routes/cambiar-clave';
import CasoDetalleRoute from './routes/caso-detalle';
import CasosRoute from './routes/casos';
import InformeDetalleRoute from './routes/informe-detalle';
import InformesRoute from './routes/informes';
import LoginRoute from './routes/login';
import OlvideClaveRoute from './routes/olvide-clave';
import RedRoute from './routes/red';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: RUTAS.login, element: <LoginRoute /> },
      { path: RUTAS.olvideClave, element: <OlvideClaveRoute /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: RUTAS.casos, element: <CasosRoute /> },
      { path: '/casos/:casoId', element: <CasoDetalleRoute /> },
      { path: RUTAS.red, element: <RedRoute /> },
      { path: RUTAS.informes, element: <InformesRoute /> },
      { path: '/informes/:codigo/:periodo', element: <InformeDetalleRoute /> },
      { path: RUTAS.auditoria, element: <AuditoriaRoute /> },
      { path: RUTAS.cambiarClave, element: <CambiarClaveRoute /> },
    ],
  },
  { path: '*', element: <Navigate to={RUTAS.casos} replace /> },
], { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } });

// El cliente HTTP redirige al login ante un 401 sin depender de hooks de React.
registerNavigationHandler((ruta) => void router.navigate(ruta, { replace: true }));