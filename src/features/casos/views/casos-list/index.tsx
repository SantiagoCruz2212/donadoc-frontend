import { useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';

import { CasosTable } from '../../components/casos-table';
import { NuevoCasoForm } from '../../components/nuevo-caso-form';
import { useCasos } from '../../hooks/use-casos';
import { useCrearCaso } from '../../hooks/use-crear-caso';

/** Lista de casos y formulario de nuevo caso. */
export default function CasosListView() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { casos, cargando, error } = useCasos();
  const nuevo = useCrearCaso();

  return (
    <>
      <h2>{t.casos.title}</h2>
      {error && <Alert tipo="error">{error}</Alert>}
      <NuevoCasoForm {...nuevo} />
      {cargando ? <p className="suave">{t.common.loading}</p> : <CasosTable casos={casos} onAbrir={(id) => navigate(RUTAS.caso(id))} />}
    </>
  );
}