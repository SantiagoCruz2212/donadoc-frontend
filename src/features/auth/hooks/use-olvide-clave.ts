import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAccion } from '@/shared/ui/hooks/use-accion';

import { restablecerClave, solicitarCodigo } from '../apis/clave-api';
import { OlvideClaveForm, olvideClaveSchema, RestablecerClaveForm, restablecerClaveSchema } from '../models/auth-models';

export type PasoRecuperacion = 'correo' | 'codigo' | 'listo';

/** Recuperar la clave en dos pasos: pedir el código al correo y canjearlo por una clave nueva. */
export function useOlvideClave() {
  const [paso, setPaso] = useState<PasoRecuperacion>('correo');
  const [correo, setCorreo] = useState('');

  const formCorreo = useForm<OlvideClaveForm>({ resolver: zodResolver(olvideClaveSchema), defaultValues: { correo: '' } });
  const formCodigo = useForm<RestablecerClaveForm>({ resolver: zodResolver(restablecerClaveSchema), defaultValues: { codigo: '', nuevaClave: '', confirmar: '' } });
  const pedir = useAccion(solicitarCodigo);
  const canjear = useAccion(restablecerClave);

  const enviarCodigo = useCallback(
    async (datos: OlvideClaveForm) => {
      if (!(await pedir.ejecutar(datos.correo))) return;
      setCorreo(datos.correo);
      setPaso('codigo');
    },
    [pedir],
  );

  const restablecer = useCallback(
    async (datos: RestablecerClaveForm) => {
      if (!(await canjear.ejecutar({ correo, codigo: datos.codigo, nuevaClave: datos.nuevaClave }))) return;
      setPaso('listo');
    },
    [canjear, correo],
  );

  const usarOtroCorreo = useCallback(() => {
    formCodigo.reset();
    canjear.limpiarError();
    setPaso('correo');
  }, [formCodigo, canjear]);

  return {
    paso,
    correo,
    usarOtroCorreo,
    correoForm: { register: formCorreo.register, errors: formCorreo.formState.errors, onSubmit: formCorreo.handleSubmit(enviarCodigo), cargando: pedir.cargando, error: pedir.error },
    codigoForm: { register: formCodigo.register, errors: formCodigo.formState.errors, onSubmit: formCodigo.handleSubmit(restablecer), cargando: canjear.cargando, error: canjear.error },
  };
}
