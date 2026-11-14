# DonaDoc Frontend

Interfaz web de **DonaDoc**, una plataforma para **diligenciar una sola vez** los formatos del INS de donación y trasplante de órganos y tejidos.
Proyecto integrador del *Diplomado en Ingeniería de Software Asistida por IA*. Autor: Santiago Andrés Castro Cruz.

Este repositorio es el **frontend**. La API, los requisitos y la arquitectura están en [donadoc-backend](https://github.com/SantiagoCruz2212/donadoc-backend) (ver su [arquitectura](https://github.com/SantiagoCruz2212/donadoc-backend/blob/main/docs/arquitectura.md) y sus [requisitos](https://github.com/SantiagoCruz2212/donadoc-backend/blob/main/docs/requisitos.md)).

## Qué hace

El coordinador de trasplantes inicia sesión, crea un caso, carga una historia clínica externa y recibe sugerencias de la IA que **acepta, modifica o rechaza** una por una. Luego diligencia un formato (el formulario se genera desde su esquema, con lo conocido precargado), obtiene el PDF y registra la firma del paciente o familiar con un código que llega a su correo. También hay pantallas de contraseña (cambiar, olvidé, restablecer), red de trasplantes vigentes sin datos personales, informes periódicos y auditoría.

## Stack

React 18 · TypeScript · Vite · React Router · Zustand · React Hook Form + Zod · Axios · i18n (español e inglés) · CSS Modules · Jest + Testing Library · ESLint.

## Estructura

```
src/
  app/        Rutas (puntos de entrada puros) y layouts con las guardias de sesión
  features/   auth, casos, documentos, extracciones, formatos, firmas, informes, red, auditoria
  shared/     config, constants, data-sources (cliente Axios), models, state-manager, storage, utils, ui
```

Cada feature se organiza en `apis/`, `components/`, `hooks/`, `models/` y `views/`: la vista solo renderiza, la lógica va en hooks y el acceso HTTP en `apis/`. Un feature **no** importa de otro (lo común va a `shared/`); ESLint lo hace cumplir.

## Cómo ejecutarlo

Requisitos: Node 22 y el [backend](https://github.com/SantiagoCruz2212/donadoc-backend) en marcha en `http://localhost:3000`.

```bash
cp .env.example .env   # variables en blanco: complete las suyas
npm ci
npm run dev            # http://localhost:5173 ; /api se reenvía al backend
```

### Variables de entorno

`.env.example` las lista **en blanco a propósito**. `.env` está en `.gitignore`.

| Variable | Para qué sirve |
|---|---|
| `VITE_TENANT_KEY` | Clave **pública** de la organización; se incorpora al compilar (cabecera `X-Tenant-Key`) |
| `VITE_ASSET_BASE` | Dónde se sirven los archivos compilados; vacío o `/` es el mismo origen, o la URL de un CDN |
| `CDN_ORIGIN` | Origen del CDN permitido por la política de contenido (CSP) al servir con nginx; vacío si no hay CDN |
| `VITE_API_BASE_URL` | Opcional: URL base de la API si no está tras el mismo origen (por defecto `/api/v1`) |

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run lint     # ESLint (tipado estricto, orden de imports, fronteras entre features)
npm test         # Jest + Testing Library (cobertura mínima del 70 %)
npm run build    # tsc --noEmit + vite build
```

## CI

El workflow [ci.yml](.github/workflows/ci.yml) ejecuta lint, pruebas y compilación, y construye la imagen Docker (sin publicarla), en cada push a `main` o `develop` y en cada pull request.

## Imagen Docker

```bash
docker build -t donadoc-frontend --build-arg VITE_TENANT_KEY=<su_clave_publica> .
```

La imagen sirve la aplicación con nginx (política de contenido con `CDN_ORIGIN` opcional). En producción va detrás de un proxy inverso que reenvía `/api/*` al backend.

## Límites conocidos

- Aún no hay URL pública desplegada.
- El manual de usuario está pendiente (hay un issue abierto en el backend).
- La interfaz está en español e inglés, pero los formatos oficiales del INS solo están en español.
