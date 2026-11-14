import { Navigate } from 'react-router-dom';

import AuditoriaView from '@/features/auditoria/views/auditoria-list';
import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';

/** Solo quien administra la institución consulta la auditoría (el backend también lo exige: esto evita una pantalla que solo mostraría 403). */
export default function AuditoriaRoute() {
  const rol = useSessionStore((s) => s.usuario?.rol);
  return rol === 'ADMIN_ORG' ? <AuditoriaView /> : <Navigate to={RUTAS.casos} replace />;
}
