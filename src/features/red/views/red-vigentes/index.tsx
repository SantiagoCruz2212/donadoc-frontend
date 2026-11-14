import { useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';

import { RedTable } from '../../components/red-table';
import { useTrasplantesVigentes } from '../../hooks/use-trasplantes-vigentes';

/** Red de trasplantes vigentes entre instituciones: solo datos no personales. */
export default function RedVigentesView() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { items, total, cargando, error } = useTrasplantesVigentes();
  return (
    <>
      <h2>{t.red.title}</h2>
      <p className="suave">{t.red.hint}</p>
      {error && <Alert tipo="error">{error}</Alert>}
      {cargando ? (
        <p className="suave">{t.common.loading}</p>
      ) : (
        <>
          <p className="suave">
            {total} {t.red.total}
          </p>
          <RedTable trasplantes={items} onAbrir={(id) => navigate(RUTAS.caso(id))} />
        </>
      )}
    </>
  );
}
