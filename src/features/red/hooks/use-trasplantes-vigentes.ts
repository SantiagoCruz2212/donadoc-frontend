import { useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarTrasplantesVigentes } from '../apis/red-api';
import { ListaRed } from '../models/red-models';

/** Carga los trasplantes vigentes de toda la red (sin datos personales). */
export function useTrasplantesVigentes() {
  const { t } = useTranslations();
  const [lista, setLista] = useState<ListaRed>({ items: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    listarTrasplantesVigentes()
      .then((l) => activo && setLista(l))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [t]);

  return { ...lista, cargando, error };
}
