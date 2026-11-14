/**
 * Permite que el cliente HTTP (que no es un componente de React) redirija al login cuando la sesión vence.
 * El router registra aquí su función de navegación al arrancar.
 */
type Navegar = (ruta: string) => void;

let navegar: Navegar | null = null;

export function registerNavigationHandler(fn: Navegar | null): void {
  navegar = fn;
}

export function navigateTo(ruta: string): void {
  if (navegar) navegar(ruta);
  else window.location.assign(ruta);
}
