import { useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';

import { AbrirInformeForm } from '../../components/abrir-informe-form';
import { InformesTable } from '../../components/informes-table';
import { useInformes } from '../../hooks/use-informes';

/** Informes periódicos: abrir o crear el de un periodo y consultar los de la organización. */
export default function InformesListView() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { plantillas, codigo, filtrar, pagina, cargando, error, anterior, siguiente } = useInformes();
  return (
    <>
      <h2>{t.informes.title}</h2>
      <p className="suave">{t.informes.hint}</p>
      {error && <Alert tipo="error">{error}</Alert>}
      <AbrirInformeForm plantillas={plantillas} onAbrir={(c, p) => navigate(RUTAS.informe(c, p))} />
      {cargando && <p className="suave">{t.common.loading}</p>}
      <InformesTable
        pagina={pagina}
        plantillas={plantillas}
        codigo={codigo}
        onFiltrar={filtrar}
        onAbrir={(i) => navigate(RUTAS.informe(i.codigo, i.periodo))}
        onAnterior={anterior}
        onSiguiente={siguiente}
      />
    </>
  );
}
