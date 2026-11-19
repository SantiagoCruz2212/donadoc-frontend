import { Navigate } from 'react-router-dom';

import CasosView from '@/features/casos/views/casos-list';
import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';

/** El superadmin solo gestiona accesos: los casos son de las instituciones (el backend responde 403 a ese rol). */
export default function CasosRoute() {
  const rol = useSessionStore((s) => s.usuario?.rol);
  return rol === 'SUPER_ADMIN' ? <Navigate to={RUTAS.accesos} replace /> : <CasosView />;
}
