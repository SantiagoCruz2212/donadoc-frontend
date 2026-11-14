import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { useDocumentoSeleccionadoStore } from '@/shared/state-manager';
import { useAccion } from '@/shared/ui/hooks/use-accion';

import { subirArchivo, subirTexto } from '../apis/documentos-api';
import { TextoForm, textoSchema } from '../models/documentos-models';

/** Registra una historia clínica por texto pegado o por archivo, y la deja seleccionada para la extracción. */
export function useRegistrarHistoria(casoId: string, onRegistrado: () => Promise<void> | void) {
  const { t } = useTranslations();
  const seleccionar = useDocumentoSeleccionadoStore((s) => s.seleccionar);
  const [aviso, setAviso] = useState('');
  const form = useForm<TextoForm>({ resolver: zodResolver(textoSchema), defaultValues: { texto: '' } });
  const texto = useAccion((contenido: string) => subirTexto(casoId, contenido));
  const archivo = useAccion((f: File) => subirArchivo(casoId, f));

  const onSubmit = useCallback(
    async (datos: TextoForm) => {
      const doc = await texto.ejecutar(datos.texto);
      if (!doc) return;
      seleccionar(doc.id);
      form.reset({ texto: '' });
      await onRegistrado();
      setAviso(t.documentos.registered);
    },
    [texto, seleccionar, form, onRegistrado, t],
  );

  const cargarArchivo = useCallback(
    async (f: File | undefined) => {
      if (!f) return;
      const doc = await archivo.ejecutar(f);
      if (!doc) return;
      seleccionar(doc.id);
      await onRegistrado();
      setAviso(`${t.documentos.fileUploaded} ${f.name}`);
    },
    [archivo, seleccionar, onRegistrado, t],
  );

  const usarEjemplo = useCallback(() => form.setValue('texto', t.documentos.sampleText, { shouldValidate: true }), [form, t]);

  return {
    register: form.register,
    errors: form.formState.errors,
    onSubmit: form.handleSubmit(onSubmit),
    usarEjemplo,
    cargarArchivo,
    cargando: texto.cargando || archivo.cargando,
    error: texto.error || archivo.error,
    aviso,
  };
}