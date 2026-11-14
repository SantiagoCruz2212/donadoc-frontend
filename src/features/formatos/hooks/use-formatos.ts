import { useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarFormatos } from '../apis/formatos-api';
import { Plantilla } from '../models/formatos-models';

/** Formatos vigentes (código, nombre y campos). */
export function useFormatos() {
  const { t } = useTranslations();
  const [formatos, setFormatos] = useState<Plantilla[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    listarFormatos()
      .then((l) => activo && setFormatos(l))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)));
    return () => {
      activo = false;
    };
  }, [t]);

  return { formatos, error };
}
