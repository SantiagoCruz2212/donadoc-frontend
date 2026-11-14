import { useContext } from 'react';

import { I18nContext, I18nValue } from './i18n-context';

/** const { t } = useTranslations();  →  t.auth.submit, t.casos.title, ... */
export function useTranslations(): I18nValue {
  return useContext(I18nContext);
}
