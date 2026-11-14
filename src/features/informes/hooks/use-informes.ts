import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarInformes, listarPlantillas } from '../apis/informes-api';
import { PaginaInformes, PlantillaInforme } from '../models/informes-models';

/** Plantillas disponibles y lista paginada de informes de la organización (filtrable por informe). */
export function useInformes() {
  const { t } = useTranslations();
  const [plantillas, setPlantillas] = useState<PlantillaInforme[]>([]);
  const [codigo, setCodigoFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [pagina, setPagina] = useState<PaginaInformes>({ items: [], page: 1, totalPages: 1, total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    listarPlantillas()
      .then((l) => activo && setPlantillas(l))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)));
    return () => {
      activo = false;
    };
  }, [t]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    listarInformes(codigo, page)
      .then((p) => activo && setPagina(p))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [codigo, page, t]);

  const filtrar = useCallback((nuevo: string) => {
    setPage(1);
    setCodigoFiltro(nuevo);
  }, []);

  return {
    plantillas,
    codigo,
    filtrar,
    pagina,
    cargando,
    error,
    anterior: () => setPage((p) => Math.max(1, p - 1)),
    siguiente: () => setPage((p) => Math.min(pagina.totalPages, p + 1)),
  };
}
