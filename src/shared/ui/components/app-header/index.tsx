import { ChangeEvent } from 'react';

import { Idioma, IDIOMAS } from '@/shared/config/i18n/types';
import { useTranslations } from '@/shared/config/i18n/use-translations';
import { clases } from '@/shared/utils/utils';

import { AppHeaderProps } from './props';
import styles from './styles.module.css';

export function AppHeader({ usuario, onCerrarSesion, navegacion = [], rutaActual = '', onNavegar }: AppHeaderProps) {
  const { t, idioma, cambiarIdioma } = useTranslations();
  const alCambiar = (e: ChangeEvent<HTMLSelectElement>) => cambiarIdioma(e.target.value as Idioma);
  return (
    <header className={styles.barra}>
      <strong>{t.common.appName}</strong>
      {navegacion.length > 0 && (
        <nav aria-label={t.nav.menu} className={styles.navegacion}>
          {navegacion.map((e) => (
            <button
              key={e.ruta}
              type="button"
              aria-current={rutaActual === e.ruta || rutaActual.startsWith(`${e.ruta}/`) ? 'page' : undefined}
              className={clases(styles.enlace, (rutaActual === e.ruta || rutaActual.startsWith(`${e.ruta}/`)) && styles.activo)}
              onClick={() => onNavegar?.(e.ruta)}
            >
              {e.texto}
            </button>
          ))}
        </nav>
      )}
      <span className={styles.usuario}>{usuario}</span>
      <select aria-label={t.common.language} className={styles.selector} value={idioma} onChange={alCambiar}>
        {IDIOMAS.map((i) => (
          <option key={i} value={i}>
            {i.toUpperCase()}
          </option>
        ))}
      </select>
      <button type="button" className={styles.salir} onClick={onCerrarSesion}>
        {t.common.logout}
      </button>
    </header>
  );
}
