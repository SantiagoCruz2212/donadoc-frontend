import { Navigate } from 'react-router-dom';

import AccesosView from '@/features/accesos/views/accesos-list';
import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';

/** Solo el superadmin gestiona accesos (el backend también lo exige: esto evita una pantalla que solo mostraría 403). */
export default function AccesosRoute() {
  const rol = useSessionStore((s) => s.usuario?.rol);
  return rol === 'SUPER_ADMIN' ? <AccesosView /> : <Navigate to={RUTAS.casos} replace />;
}
