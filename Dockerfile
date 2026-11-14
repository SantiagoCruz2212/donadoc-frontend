FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Clave PÚBLICA de la organización (solo selecciona el tenant; no es un secreto)
ARG VITE_TENANT_KEY=pk_demo_clinica
ENV VITE_TENANT_KEY=$VITE_TENANT_KEY
# Dónde se sirven los archivos compilados: "/" (mismo origen) o la URL de un CDN, p. ej. https://cdn.ejemplo.com/
ARG VITE_ASSET_BASE=/
ENV VITE_ASSET_BASE=$VITE_ASSET_BASE
RUN npm run build

FROM nginx:1.27-alpine
# Origen del CDN permitido por la política de contenido (CSP); vacío si todo se sirve del mismo origen.
ENV CDN_ORIGIN=""
# La imagen oficial procesa /etc/nginx/templates/*.template con envsubst y deja el resultado en /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY seguridad.inc.template /etc/nginx/templates/seguridad.inc.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
