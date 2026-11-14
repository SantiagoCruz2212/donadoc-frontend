import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';

import { RedTableProps } from './props';
import styles from './styles.module.css';

export function RedTable({ trasplantes, onAbrir }: RedTableProps) {
  const { t } = useTranslations();
  return (
    <Card>
      <table>
        <thead>
          <tr>
            <th>{t.red.code}</th>
            <th>{t.red.institution}</th>
            <th>{t.red.donorType}</th>
            <th>{t.red.state}</th>
            <th>{t.red.start}</th>
            <th>{t.red.components}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {trasplantes.map((x) => (
            <tr key={x.codigo}>
              <td>
                <code>{x.codigo}</code>
              </td>
              <td>
                {x.institucion} {x.esPropio && <Chip texto={t.red.own} />}
              </td>
              <td>{x.tipoDonante ?? '—'}</td>
              <td>
                <Chip texto={x.estado} />
              </td>
              <td>{x.fechaInicio}</td>
              <td>
                <ul className={styles.componentes}>
                  {x.componentes.map((c, i) => (
                    <li key={`${c.tipoComponente}-${i}`}>
                      {c.tipoComponente} <span className="suave">({c.rescatado ? t.red.rescued : t.red.notRescued})</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {x.esPropio && x.casoId && (
                  <Button variante="enlace" onClick={() => onAbrir(x.casoId as string)}>
                    {t.red.open}
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {trasplantes.length === 0 && (
            <tr>
              <td colSpan={7} className="suave">
                {t.red.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
