import { applyTheme, colors } from './theme';

describe('theme', () => {
  it('publica los tokens como variables CSS en el elemento raíz', () => {
    const raiz = document.createElement('div');
    applyTheme(raiz);
    expect(raiz.style.getPropertyValue('--color-primary')).toBe(colors.primary);
    expect(raiz.style.getPropertyValue('--space-md')).toBe('16px');
    expect(raiz.style.getPropertyValue('--color-success-background')).toBe(colors.successBackground);
    expect(raiz.style.getPropertyValue('--font-family')).toContain('system-ui');
  });
});