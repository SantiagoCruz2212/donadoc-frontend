export interface EnlaceNavegacion {
  texto: string;
  ruta: string;
}

export interface AppHeaderProps {
  usuario: string;
  onCerrarSesion: () => void;
  /** Enlaces de la barra (casos, red, auditoría…). El encabezado no conoce las rutas: las recibe. */
  navegacion?: EnlaceNavegacion[];
  /** Ruta actual, para marcar el enlace activo. */
  rutaActual?: string;
  onNavegar?: (ruta: string) => void;
}
