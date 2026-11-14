import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { agregarComponente, listarComponentes } from '../apis/casos-api';
import { Componente, ComponenteForm, componenteSchema } from '../models/casos-models';

/** Órganos y tejidos de un caso: lista y alta (lo que luego ve la red de trasplantes, sin datos personales). */
export function useComponentes(casoId: string) {
  const { t } = useTranslations();
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [error, setError] = useState('');
  const form = useForm<ComponenteForm>({
    resolver: zodResolver(componenteSchema),
    defaultValues: { tipoComponente: 'RINON', rescatado: true, causaNoRescate: '' },
  });

  const recargar = useCallback(async () => {
    try {
      setComponentes(await listarComponentes(casoId));
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [casoId, t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const agregar = form.handleSubmit(async (datos) => {
    setError('');
    try {
      await agregarComponente(casoId, datos);
      form.reset({ tipoComponente: datos.tipoComponente, rescatado: true, causaNoRescate: '' });
      await recargar();
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  });

  return { componentes, error, register: form.register, errors: form.formState.errors, watch: form.watch, agregar };
}
