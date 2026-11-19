# Pruebas funcionales de navegador (34 casos)

Recorren la interfaz real con Chrome o Edge (puppeteer-core). Necesitan dos backends (repositorio `donadoc-backend`) y dos interfaces.
**No se ejecutan en el CI** (requieren navegador y varios procesos); se ejecutaron en el módulo 4 (34 de 34) y quedan como evidencia reproducible.

1. `npm run build` en la raíz y `npm install` en esta carpeta (`pruebas`).
2. Backend A en el puerto 3000 con IA simulada y usuario demo: `EXTRACTOR_IA_PROVIDER=mock SEED_ENABLED=true SEED_ADMIN_PASSWORD=<clave> PORT=3000 node dist/main.js`.
3. Backend B en el 3001 con el proveedor de IA caído: `EXTRACTOR_IA_PROVIDER=ollama OLLAMA_URL=http://127.0.0.1:1 IA_TIMEOUT_MS=1500 PORT=3001 node dist/main.js`.
4. Interfaces: `node pruebas/funcionales/servir-ui.mjs 4173 3000` y `node pruebas/funcionales/servir-ui.mjs 4174 3001`.
5. `cd pruebas && ADMIN_PASSWORD=<clave> BROWSER_PATH=<ruta del navegador> npm run funcionales`.
