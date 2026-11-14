import { useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';
import { Alert } from '@/shared/ui/components/alert';

import { CasoAcciones } from '../../components/caso-acciones';
import { CasoResumen } from '../../components/caso-resumen';
import { ComponentesPanel } from '../../components/componentes-panel';
import { useCaso } from '../../hooks/use-caso';
import { useCasoAcciones } from '../../hooks/use-caso-acciones';
import { useComponentes } from '../../hooks/use-componentes';

/** Encabezado del detalle de un caso: donante, estado y sus acciones, y los órganos/tejidos registrados. */
export default function CasoResumenView({ casoId }: { casoId: string }) {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const esAdmin = useSessionStore((s) => s.usuario?.rol === 'ADMIN_ORG');
  const { caso, error, recargar } = useCaso(casoId);
  const acciones = useCasoAcciones(casoId, recargar, () => navigate(RUTAS.casos, { replace: true }));
  const comps = useComponentes(casoId);

  if (error) return <Alert tipo="error">{error}</Alert>;
  if (!caso) return <p className="suave">{t.common.loading}</p>;
  return (
    <>
      <CasoResumen caso={caso} onVolver={() => navigate(RUTAS.casos)} />
      <CasoAcciones estado={caso.estado} esAdmin={esAdmin} ocupado={acciones.ocupado} error={acciones.error} aviso={acciones.aviso} onCambiar={(s, c) => void acciones.cambiar(s, c)} onEliminar={() => void acciones.eliminar()} />
      <ComponentesPanel componentes={comps.componentes} register={comps.register} errors={comps.errors} rescatado={comps.watch('rescatado')} onSubmit={comps.agregar} error={comps.error} />
    </>
  );
}
