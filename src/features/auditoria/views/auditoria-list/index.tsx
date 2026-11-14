import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';

import { AuditoriaFiltros } from '../../components/auditoria-filtros';
import { AuditoriaTable } from '../../components/auditoria-table';
import { useAuditoria } from '../../hooks/use-auditoria';

/** Traza de auditoría de la institución (solo ADMIN_ORG). */
export default function AuditoriaListView() {
  const { t } = useTranslations();
  const { filtros, cambiar, filtrar, limpiar, pagina, cargando, error, anterior, siguiente } = useAuditoria();
  return (
    <>
      <h2>{t.auditoria.title}</h2>
      <p className="suave">{t.auditoria.hint}</p>
      <AuditoriaFiltros filtros={filtros} onCambiar={cambiar} onFiltrar={filtrar} onLimpiar={limpiar} />
      {error && <Alert tipo="error">{error}</Alert>}
      {cargando ? <p className="suave">{t.common.loading}</p> : <AuditoriaTable pagina={pagina} onAnterior={anterior} onSiguiente={siguiente} />}
    </>
  );
}
