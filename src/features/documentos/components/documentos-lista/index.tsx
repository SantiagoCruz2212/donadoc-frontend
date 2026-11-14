import { useTranslations } from '@/shared/config/i18n/use-translations';
import { formatearFechaHora } from '@/shared/utils/utils';

import { DocumentosListaProps } from './props';
import styles from './styles.module.css';

export function DocumentosLista({ documentos, seleccionadoId, onSeleccionar }: DocumentosListaProps) {
  const { idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  if (documentos.length === 0) return null;
  return (
    <ul className={styles.lista}>
      {documentos.map((d) => (
        <li key={d.id}>
          <label>
            <input type="radio" name="documento" checked={seleccionadoId === d.id} onChange={() => onSeleccionar(d.id)} />
            {d.nombreArchivo ?? d.id} <span className="suave">· {formatearFechaHora(d.creadoEn, locale)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}