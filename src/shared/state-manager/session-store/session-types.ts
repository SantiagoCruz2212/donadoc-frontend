export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  perfil: string | null;
}

export interface SessionState {
  accessToken: string | null;
  usuario: UsuarioSesion | null;
}

export interface SessionActions {
  iniciarSesion: (accessToken: string, usuario: UsuarioSesion) => void;
  cerrarSesion: () => void;
}

export type SessionStore = SessionState & SessionActions;
