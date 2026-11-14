import { Navigate, Outlet } from 'react-router-dom';

import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';

/** Rutas públicas (login): si ya hay sesión se entra directo a los casos. */
export default function PublicLayout() {
  const accessToken = useSessionStore((s) => s.accessToken);
  return accessToken ? <Navigate to={RUTAS.casos} replace /> : <Outlet />;
}