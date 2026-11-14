import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { RUTAS } from '@/shared/constants/constants';
import { useAccion } from '@/shared/ui/hooks/use-accion';

import { crearCaso } from '../apis/casos-api';
import { CrearCasoForm, crearCasoSchema } from '../models/casos-models';

/** Formulario de nuevo caso: valida con Zod, crea el caso y abre su detalle. */
export function useCrearCaso() {
  const navigate = useNavigate();
  const form = useForm<CrearCasoForm>({
    resolver: zodResolver(crearCasoSchema),
    defaultValues: { tipoDocumento: 'CC', numeroDocumento: '', nombres: '', apellidos: '' },
  });
  const { ejecutar, cargando, error } = useAccion(crearCaso);

  const onSubmit = useCallback(
    async (datos: CrearCasoForm) => {
      const caso = await ejecutar(datos);
      if (caso) navigate(RUTAS.caso(caso.id));
    },
    [ejecutar, navigate],
  );

  return { register: form.register, errors: form.formState.errors, onSubmit: form.handleSubmit(onSubmit), cargando, error };
}