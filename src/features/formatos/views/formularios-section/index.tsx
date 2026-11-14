import { useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';

import { FormularioDinamico } from '../../components/formulario-dinamico';
import { useFormatos } from '../../hooks/use-formatos';
import { useFormulario } from '../../hooks/use-formulario';
import { FormularioActivo } from '../../models/formatos-models';

interface FormulariosSectionProps {
  casoId: string;
  /** Se llama cada vez que cambia el formato abierto o su estado (el detalle del caso lo usa para habilitar las firmas). */
  onFormularioChange?: (a: FormularioActivo) => void;
  /** Cambiar este número vuelve a cargar el formato abierto (p. ej. tras sellar una firma). */
  recarga?: number;
}

/** Sección «Formatos»: se elige un formato y se diligencia con el formulario que genera su esquema. */
export default function FormulariosSection({ casoId, onFormularioChange, recarga = 0 }: FormulariosSectionProps) {
  const { t } = useTranslations();
  const { formatos, error: errorLista } = useFormatos();
  const [codigo, setCodigo] = useState('');
  const f = useFormulario(casoId, codigo, onFormularioChange, recarga);

  return (
    <Card titulo={t.formatos.title}>
      <p className="suave">{t.formatos.hint}</p>
      {(errorLista || f.error) && <Alert tipo="error">{errorLista || f.error}</Alert>}
      {f.aviso && !f.error && <Alert tipo="ok">{f.aviso}</Alert>}
      <Field etiqueta={t.formatos.format}>
        <select value={codigo} onChange={(e) => setCodigo(e.target.value)}>
          <option value="">{t.formatos.choose}</option>
          {formatos.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.nombre}
            </option>
          ))}
        </select>
      </Field>
      {codigo && !f.formulario && !f.error && <p className="suave">{t.formatos.loading}</p>}
      {f.formulario && (
        <FormularioDinamico
          formulario={f.formulario}
          register={f.register}
          precargados={f.precargados}
          errores={f.errores}
          cargando={f.cargando}
          onGuardar={(completo) => void f.guardar(completo)}
          onDescargar={() => void f.descargar()}
        />
      )}
    </Card>
  );
}
