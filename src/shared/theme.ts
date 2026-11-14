/** Fuente de verdad del diseño: colores, espaciado y radios. Se publican como variables CSS al arrancar. */
export const colors = {
  primary: '#0b5c6b',
  primaryContrast: '#ffffff',
  background: '#f4f8f9',
  surface: '#ffffff',
  text: '#17242a',
  textMuted: '#5a6b78',
  border: '#cdd9de',
  danger: '#c8553d',
  success: '#2e8b57',
  warning: '#b8860b',
  chipBackground: '#e6f2f4',
  successBackground: '#ddf3e4',
  warningBackground: '#fff4d6',
  dangerBackground: '#fdeceb',
} as const;

export const spacing = { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px' } as const;
export const radius = { sm: '6px', md: '10px', pill: '12px' } as const;
export const typography = { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", base: '16px', small: '0.9rem' } as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Escribe los tokens del tema como variables CSS (--color-primary, --space-md, ...) en el elemento raíz. */
export function applyTheme(root: HTMLElement = document.documentElement): void {
  const grupos: [string, Record<string, string>][] = [['color', colors], ['space', spacing], ['radius', radius]];
  for (const [prefijo, tokens] of grupos) {
    for (const [nombre, valor] of Object.entries(tokens)) root.style.setProperty(`--${prefijo}-${kebab(nombre)}`, valor);
  }
  root.style.setProperty('--font-family', typography.fontFamily);
}
