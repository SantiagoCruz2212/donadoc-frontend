import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { RUTAS } from '@/shared/constants/constants';
import { useSessionStore } from '@/shared/state-manager';
import { useAccion } from '@/shared/ui/hooks/use-accion';

import { login } from '../apis/login-api';
import { LoginForm, loginSchema } from '../models/auth-models';

/** Lógica del inicio de sesión: valida con Zod, llama a la API, guarda la sesión y entra a la app. */
export function useLogin() {
  const navigate = useNavigate();
  const iniciarSesion = useSessionStore((s) => s.iniciarSesion);
  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { correo: '', clave: '' } });
  const { ejecutar, cargando, error } = useAccion(login);

  const onSubmit = useCallback(
    async (datos: LoginForm) => {
      const sesion = await ejecutar(datos);
      if (!sesion) return;
      iniciarSesion(sesion.accessToken, sesion.usuario);
      // El superadmin no trabaja con casos: su pantalla de inicio es la gestión de accesos.
      navigate(sesion.usuario.rol === 'SUPER_ADMIN' ? RUTAS.accesos : RUTAS.casos, { replace: true });
    },
    [ejecutar, iniciarSesion, navigate],
  );

  return { register: form.register, errors: form.formState.errors, onSubmit: form.handleSubmit(onSubmit), cargando, error };
}