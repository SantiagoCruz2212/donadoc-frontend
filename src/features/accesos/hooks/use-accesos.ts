import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { useAccion } from '@/shared/ui/hooks/use-accion';
import { mensajeDeError } from '@/shared/utils/utils';

import { crearAcceso, listarAccesos, restablecerAcceso } from '../apis/accesos-api';
import { Acceso, CrearAccesoForm, crearAccesoSchema } from '../models/accesos-models';

/** Lista de accesos de la organización, alta de un acceso nuevo y restablecimiento de clave (la clave llega por correo). */
export function useAccesos() {
  const { t } = useTranslations();
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState('');
  const [aviso, setAviso] = useState('');

  const form = useForm<CrearAccesoForm>({
    resolver: zodResolver(crearAccesoSchema),
    defaultValues: { correo: '', nombre: '', rol: 'OPERADOR', perfil: '' },
  });
  const crear = useAccion(crearAcceso);
  const restablecer = useAccion(restablecerAcceso);

  const recargar = useCallback(async () => {
    setCargando(true);
    setErrorLista('');
    try {
      setAccesos(await listarAccesos());
    } catch (e) {
      setErrorLista(mensajeDeError(e, t.common.unexpectedError));
    } finally {
      setCargando(false);
    }
  }, [t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const enviar = form.handleSubmit(async (datos) => {
    setAviso('');
    const creado = await crear.ejecutar(datos);
    if (!creado) return;
    setAviso(`${t.accesos.created} ${creado.correo}`);
    form.reset();
    await recargar();
  });

  const nuevaClave = useCallback(
    async (id: string) => {
      setAviso('');
      const r = await restablecer.ejecutar(id);
      if (r) setAviso(`${t.accesos.resetDone} ${r.correo}`);
    },
    [restablecer, t],
  );

  return {
    accesos,
    cargando,
    errorLista,
    aviso,
    errorAccion: crear.error || restablecer.error,
    formulario: { register: form.register, errors: form.formState.errors, onSubmit: enviar, cargando: crear.cargando },
    nuevaClave,
    restableciendo: restablecer.cargando,
  };
}
