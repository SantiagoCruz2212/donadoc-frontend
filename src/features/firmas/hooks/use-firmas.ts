import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { comprobarIntegridad, crearFirmante, enviarCodigoFirma, listarFirmas, verificarFirma } from '../apis/firmas-api';
import { Firma, NuevoFirmanteForm, nuevoFirmanteSchema, Verificacion } from '../models/firmas-models';

/**
 * Firmas de un documento: lista, alta de firmantes, envío del código al correo, verificación (sella la firma) y comprobación de integridad.
 * `onFirmado` avisa cuando una firma queda sellada (el documento pudo pasar a FIRMADO).
 */
export function useFirmas(casoId: string, documentoId: string | null, onFirmado?: () => void) {
  const { t } = useTranslations();
  const [firmas, setFirmas] = useState<Firma[]>([]);
  const [verificaciones, setVerificaciones] = useState<Record<string, Verificacion>>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const form = useForm<NuevoFirmanteForm>({ resolver: zodResolver(nuevoFirmanteSchema), defaultValues: { firmanteNombre: '', firmanteRol: 'FAMILIAR', firmanteCorreo: '' } });

  const recargar = useCallback(async () => {
    if (!documentoId) {
      setFirmas([]);
      return;
    }
    try {
      setFirmas(await listarFirmas(casoId, documentoId));
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [casoId, documentoId, t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  /** Ejecuta una operación con el estado de «ocupado» de una firma y el manejo común de errores. */
  const operar = useCallback(
    async (firmaId: string, op: () => Promise<void>) => {
      setEnviando(firmaId);
      setError('');
      setAviso('');
      try {
        await op();
      } catch (e) {
        setError(mensajeDeError(e, t.common.unexpectedError));
      } finally {
        setEnviando(null);
      }
    },
    [t],
  );

  const agregar = form.handleSubmit(async (datos) => {
    if (!documentoId) return;
    setError('');
    try {
      await crearFirmante(casoId, documentoId, datos);
      form.reset({ firmanteNombre: '', firmanteRol: 'FAMILIAR', firmanteCorreo: '' });
      await recargar();
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  });

  const enviarCodigo = (firmaId: string) =>
    operar(firmaId, async () => {
      await enviarCodigoFirma(firmaId);
      setAviso(t.firmas.codeSent);
    });

  const firmar = (firmaId: string, codigo: string) =>
    operar(firmaId, async () => {
      await verificarFirma(firmaId, codigo);
      await recargar();
      onFirmado?.();
    });

  const comprobar = (firmaId: string) =>
    operar(firmaId, async () => {
      const v = await comprobarIntegridad(firmaId);
      setVerificaciones((m) => ({ ...m, [firmaId]: v }));
    });

  return {
    firmas,
    verificaciones,
    enviando,
    error,
    aviso,
    register: form.register,
    errors: form.formState.errors,
    agregar,
    enviarCodigo,
    firmar,
    comprobar,
  };
}
