import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAccion } from '@/shared/ui/hooks/use-accion';

import { cambiarClave } from '../apis/clave-api';
import { CambiarClaveForm, cambiarClaveSchema } from '../models/auth-models';

/** Cambiar la clave con la sesión iniciada. La API responde 422 si la clave actual no es correcta (sin cerrar la sesión). */
export function useCambiarClave() {
  const [hecho, setHecho] = useState(false);
  const form = useForm<CambiarClaveForm>({ resolver: zodResolver(cambiarClaveSchema), defaultValues: { claveActual: '', nuevaClave: '', confirmar: '' } });
  const { ejecutar, cargando, error } = useAccion(cambiarClave);

  const onSubmit = useCallback(
    async (datos: CambiarClaveForm) => {
      setHecho(false);
      if (!(await ejecutar({ claveActual: datos.claveActual, nuevaClave: datos.nuevaClave }))) return;
      form.reset();
      setHecho(true);
    },
    [ejecutar, form],
  );

  return { register: form.register, errors: form.formState.errors, onSubmit: form.handleSubmit(onSubmit), cargando, error, hecho };
}
