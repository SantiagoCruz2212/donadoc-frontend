import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Chip } from '@/shared/ui/components/chip';

import { CasoResumenProps } from './props';

export function CasoResumen({ caso, onVolver }: CasoResumenProps) {
  const { t } = useTranslations();
  return (
    <>
      <Button variante="enlace" onClick={onVolver}>
        {t.common.back}
      </Button>
      <h2>
        {t.casos.caseOf} {caso.donante?.nombres} {caso.donante?.apellidos}
      </h2>
      <p className="suave">
        {caso.donante?.tipoDocumento} {caso.donante?.numeroDocumento} · {t.casos.state} <Chip texto={caso.estado} />
      </p>
    </>
  );
}