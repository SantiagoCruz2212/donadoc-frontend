import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';

import { AccesoForm } from '../../components/acceso-form';
import { AccesosTable } from '../../components/accesos-table';
import { useAccesos } from '../../hooks/use-accesos';

/** Gestión de accesos de la organización (solo SUPER_ADMIN): alta con clave aleatoria enviada por correo. */
export default function AccesosListView() {
  const { t } = useTranslations();
  const { accesos, cargando, errorLista, aviso, errorAccion, formulario, nuevaClave, restableciendo } = useAccesos();
  return (
    <>
      <h2>{t.accesos.title}</h2>
      <p className="suave">{t.accesos.hint}</p>
      <AccesoForm {...formulario} />
      {aviso && <Alert tipo="ok">{aviso}</Alert>}
      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {errorLista && <Alert tipo="error">{errorLista}</Alert>}
      {cargando ? <p className="suave">{t.common.loading}</p> : <AccesosTable accesos={accesos} onNuevaClave={(id) => void nuevaClave(id)} ocupado={restableciendo} />}
    </>
  );
}
