import { useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';

import { periodicidadDe, periodoValido } from '../../models/informes-models';
import { AbrirInformeFormProps } from './props';
import styles from './styles.module.css';

/** «Nuevo / abrir informe»: se elige el informe y el periodo (mes o semana) y se pasa a diligenciarlo. */
export function AbrirInformeForm({ plantillas, onAbrir }: AbrirInformeFormProps) {
  const { t } = useTranslations();
  const [codigo, setCodigo] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [errorPeriodo, setErrorPeriodo] = useState('');

  const plantilla = plantillas.find((p) => p.codigo === codigo);
  const periodicidad = plantilla ? periodicidadDe(plantilla.esquema) : 'MENSUAL';

  return (
    <Card titulo={t.informes.openTitle}>
      <form
        className={styles.formulario}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const sinInforme = !plantilla;
          setErrorCodigo(sinInforme ? t.informes.chooseReport : '');
          const invalido = !periodoValido(periodicidad, periodo);
          setErrorPeriodo(invalido ? (periodicidad === 'MENSUAL' ? t.informes.invalidMonthly : t.informes.invalidWeekly) : '');
          if (!sinInforme && !invalido) onAbrir(codigo, periodo);
        }}
      >
        <Field etiqueta={t.informes.report} error={errorCodigo}>
          <select
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setPeriodo('');
              setErrorPeriodo('');
            }}
          >
            <option value="">{t.informes.choose}</option>
            {plantillas.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field etiqueta={periodicidad === 'MENSUAL' ? t.informes.periodMonth : t.informes.periodWeek} error={errorPeriodo}>
          {periodicidad === 'MENSUAL' ? (
            <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
          ) : (
            <input type="text" value={periodo} placeholder="2026-S42" maxLength={8} onChange={(e) => setPeriodo(e.target.value.toUpperCase())} />
          )}
        </Field>
        <div className={styles.boton}>
          <Button type="submit">{t.informes.openReport}</Button>
        </div>
      </form>
    </Card>
  );
}
