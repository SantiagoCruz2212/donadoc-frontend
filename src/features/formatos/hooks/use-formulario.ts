import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { descargarBlob, erroresPorCampo, mensajeDeError } from '@/shared/utils/utils';

import { descargarPdf, guardarFormulario, obtenerFormulario } from '../apis/formatos-api';
import { Formulario, FormularioActivo, limpiarValores, Valores, valoresIniciales } from '../models/formatos-models';

/**
 * Formulario de un formato para un caso: carga el esquema y los datos, precarga lo conocido, guarda como borrador o completo
 * (mostrando los errores de la API por campo) y descarga el PDF. Informa al padre el estado para habilitar las firmas.
 */
export function useFormulario(casoId: string, codigo: string, onCambio?: (a: FormularioActivo) => void, recarga = 0) {
  const { t } = useTranslations();
  const form = useForm<Valores>({ defaultValues: {} });
  const { reset, getValues } = form;
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [precargados, setPrecargados] = useState<string[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  // El callback del padre se guarda en una referencia: si cambiara su identidad no debe repetirse la carga.
  const alCambiar = useRef(onCambio);
  alCambiar.current = onCambio;

  const aplicar = useCallback(
    (f: Formulario) => {
      const { valores, precargados: p } = valoresIniciales(f);
      reset(valores);
      setPrecargados(p);
      setFormulario(f);
      alCambiar.current?.({ documentoId: f.documentoId, estado: f.estado, version: f.version });
    },
    [reset],
  );

  useEffect(() => {
    if (!codigo) {
      setFormulario(null);
      return undefined;
    }
    let activo = true;
    setError('');
    setAviso('');
    setErrores({});
    setFormulario(null);
    obtenerFormulario(casoId, codigo)
      .then((f) => activo && aplicar(f))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)));
    return () => {
      activo = false;
    };
  }, [casoId, codigo, t, aplicar, recarga]);

  const guardar = useCallback(
    async (completo: boolean) => {
      if (!formulario) return;
      setCargando(true);
      setError('');
      setAviso('');
      setErrores({});
      try {
        const nuevo = await guardarFormulario(casoId, codigo, limpiarValores(formulario.plantilla.esquema, getValues()), completo);
        aplicar(nuevo);
        setAviso(completo ? t.formatos.completed : t.formatos.saved);
      } catch (e) {
        setErrores(erroresPorCampo(e));
        setError(mensajeDeError(e, t.common.unexpectedError));
      } finally {
        setCargando(false);
      }
    },
    [formulario, casoId, codigo, getValues, aplicar, t],
  );

  const descargar = useCallback(async () => {
    setError('');
    try {
      descargarBlob(await descargarPdf(casoId, codigo), `${codigo}-v${formulario?.version ?? 1}.pdf`);
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [casoId, codigo, formulario, t]);

  return { register: form.register, formulario, precargados, errores, error, aviso, cargando, guardar, descargar };
}
