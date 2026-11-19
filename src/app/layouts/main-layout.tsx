import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';
import { AppHeader } from '@/shared/ui/components/app-header';

/** Rutas privadas: sin sesión se redirige al login; con sesión se muestra el encabezado con la navegación y la ruta hija. */
export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslations();
  const { accessToken, usuario, cerrarSesion } = useSessionStore();
  if (!accessToken) return <Navigate to={RUTAS.login} replace />;
  // La auditoría solo la consulta quien administra la institución (el backend lo exige igualmente: esto solo evita un enlace inútil).
  const esSuperadmin = usuario?.rol === 'SUPER_ADMIN';
  const navegacion = [
    // El superadmin solo gestiona accesos: casos y red son de las instituciones (el backend le responde 403).
    ...(esSuperadmin ? [] : [{ texto: t.nav.cases, ruta: RUTAS.casos }, { texto: t.nav.network, ruta: RUTAS.red }]),
    // Los informes periódicos los diligencian quienes pertenecen a una organización (el backend lo exige igualmente).
    ...(usuario?.rol === 'ADMIN_ORG' || usuario?.rol === 'OPERADOR' ? [{ texto: t.nav.reports, ruta: RUTAS.informes }] : []),
    ...(usuario?.rol === 'ADMIN_ORG' ? [{ texto: t.nav.audit, ruta: RUTAS.auditoria }] : []),
    ...(usuario?.rol === 'SUPER_ADMIN' ? [{ texto: t.nav.access, ruta: RUTAS.accesos }] : []),
    { texto: t.nav.changePassword, ruta: RUTAS.cambiarClave },
  ];
  return (
    <>
      <AppHeader
        usuario={usuario?.nombre ?? ''}
        navegacion={navegacion}
        rutaActual={pathname}
        onNavegar={(ruta) => navigate(ruta)}
        onCerrarSesion={() => {
          cerrarSesion();
          navigate(RUTAS.login, { replace: true });
        }}
      />
      <main>
        <Outlet />
      </main>
    </>
  );
}
