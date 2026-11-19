// Pruebas FUNCIONALES de punta a punta: un navegador real (Edge/Chrome) usa la interfaz compilada, que habla con la API real y PostgreSQL.
// Requisitos: backend y frontend en marcha (ver Pruebas/README.md). Variables:
//   UI_URL (por defecto http://127.0.0.1:4173)        interfaz que apunta al backend con el simulador de IA
//   UI_FALLA_URL (por defecto http://127.0.0.1:4174)  interfaz que apunta a un backend con el proveedor de IA caído
//   ADMIN_PASSWORD  (obligatoria)  contraseña del usuario demo;  ADMIN_EMAIL (por defecto coordinador@demo.local)
//   BROWSER_PATH    ruta de Edge/Chrome (por defecto Edge en Windows)
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const AQUI = dirname(fileURLToPath(import.meta.url));
const UI = process.env.UI_URL ?? 'http://127.0.0.1:4173';
const UI_FALLA = process.env.UI_FALLA_URL ?? 'http://127.0.0.1:4174';
const CORREO = process.env.ADMIN_EMAIL ?? 'coordinador@demo.local';
const CLAVE = process.env.ADMIN_PASSWORD;
const NAVEGADOR = process.env.BROWSER_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const FOTOS = resolve(AQUI, '../resultados/funcionales');
const PDF_EJEMPLO = resolve(AQUI, '../ejemplos/historia_clinica_sintetica.pdf');
if (!CLAVE) throw new Error('Defina ADMIN_PASSWORD (la contraseña del usuario demo).');
mkdirSync(FOTOS, { recursive: true });

let navegador;
before(async () => { navegador = await puppeteer.launch({ executablePath: NAVEGADOR, headless: 'new', args: ['--no-sandbox'] }); });
after(async () => { await navegador.close(); });

const ipAleatoria = () => `10.${Math.floor(Math.random() * 240) + 1}.${Math.floor(Math.random() * 240) + 1}.${Math.floor(Math.random() * 240) + 1}`;
const documentoAleatorio = () => String(Math.floor(10_000_000 + Math.random() * 89_999_999));

/** Página nueva en un contexto aislado (sin sesión previa) y con una IP distinta (el límite de solicitudes es por IP). */
async function pagina(base = UI) {
  const ctx = await navegador.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1.25 });
  await p.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoria() });
  p.base = base; p.ctx = ctx;
  return p;
}
const texto = (p, t, ms = 10000) => p.waitForFunction((x) => document.body.innerText.includes(x), { timeout: ms }, t);
const noTexto = (p, t, ms = 10000) => p.waitForFunction((x) => !document.body.innerText.includes(x), { timeout: ms }, t);
const hay = (p, t) => p.evaluate((x) => document.body.innerText.includes(x), t);
const clic = (p, etiqueta) => p.locator(`button::-p-text(${etiqueta})`).click();
const ruta = (p) => new URL(p.url()).pathname;
const esperarRuta = (p, re, ms = 10000) => p.waitForFunction((r) => new RegExp(r).test(location.pathname), { timeout: ms }, re.source);
const foto = (p, nombre) => p.screenshot({ path: join(FOTOS, `${nombre}.png`), fullPage: true });
const archivoTemporal = (nombre, contenido) => { const f = join(tmpdir(), `donadoc-${Date.now()}-${nombre}`); writeFileSync(f, contenido); return f; };

async function ingresar(p, correo = CORREO, clave = CLAVE) {
  await p.goto(`${p.base}/login`, { waitUntil: 'networkidle0' });
  await p.type('input[type=email]', correo);
  await p.type('input[type=password]', clave);
  await clic(p, 'Ingresar');
}
async function sesion(base = UI) {
  const p = await pagina(base);
  await ingresar(p);
  await texto(p, 'Casos de donación');
  return p;
}
async function crearCaso(p, { documento = documentoAleatorio(), nombres = 'Juan', apellidos = 'Pérez (sintético)' } = {}) {
  const campos = await p.$$('form input');
  await campos[0].type(documento);
  await campos[1].type(nombres);
  await campos[2].type(apellidos);
  await clic(p, 'Crear caso');
  await esperarRuta(p, /^\/casos\/[0-9a-f-]{36}$/);
  await texto(p, 'Caso de');
  return documento;
}
async function conCaso(base = UI) {
  const p = await sesion(base);
  const documento = await crearCaso(p);
  return { p, documento };
}
async function registrarEjemplo(p) {
  await clic(p, 'Usar ejemplo sintético');
  await clic(p, 'Registrar texto');
  await texto(p, 'Historia clínica registrada.');
}
const filas = (p) => p.$$eval('table tbody tr', (r) => r.length);

describe('Sesión y acceso', () => {
  it('CF-01 un usuario válido inicia sesión y ve la lista de casos', async () => {
    const p = await pagina();
    await ingresar(p);
    await texto(p, 'Casos de donación');
    assert.equal(ruta(p), '/casos');
    await foto(p, 'cf-01-casos-tras-login');
    await p.ctx.close();
  });

  it('CF-02 una clave incorrecta muestra «Credenciales inválidas» y no entra', async () => {
    const p = await pagina();
    await ingresar(p, CORREO, 'clave-incorrecta');
    await texto(p, 'Credenciales inválidas');
    assert.equal(ruta(p), '/login');
    await foto(p, 'cf-02-credenciales-invalidas');
    await p.ctx.close();
  });

  it('CF-03 el formulario de ingreso valida los campos antes de enviar', async () => {
    const p = await pagina();
    await p.goto(`${p.base}/login`, { waitUntil: 'networkidle0' });
    await p.type('input[type=email]', 'no-es-un-correo');
    await clic(p, 'Ingresar');
    await texto(p, 'Ingrese un correo válido');
    await texto(p, 'Este campo es obligatorio');
    assert.equal(ruta(p), '/login');
    await p.ctx.close();
  });

  it('CF-04 una ruta privada sin sesión redirige al ingreso', async () => {
    const p = await pagina();
    await p.goto(`${p.base}/casos`, { waitUntil: 'networkidle0' });
    await esperarRuta(p, /^\/login$/);
    await p.ctx.close();
  });

  it('CF-05 cerrar sesión devuelve al ingreso y cierra el acceso a las rutas privadas', async () => {
    const p = await sesion();
    await clic(p, 'Cerrar sesión');
    await esperarRuta(p, /^\/login$/);
    await p.goto(`${p.base}/casos`, { waitUntil: 'networkidle0' });
    await esperarRuta(p, /^\/login$/);
    await p.ctx.close();
  });

  it('CF-06 la sesión se conserva al recargar la página', async () => {
    const p = await sesion();
    await p.reload({ waitUntil: 'networkidle0' });
    await texto(p, 'Casos de donación');
    assert.equal(ruta(p), '/casos');
    await p.ctx.close();
  });

  it('CF-07 ni la clave ni el token quedan en la dirección de la página', async () => {
    const p = await sesion();
    assert.ok(!p.url().includes(CLAVE));
    assert.ok(!/eyJ[A-Za-z0-9_-]{10,}/.test(p.url()));
    await p.ctx.close();
  });

  it('CF-08 la clave escrita no se guarda en el almacenamiento del navegador', async () => {
    const p = await sesion();
    const almacen = await p.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
    assert.ok(!almacen.includes(CLAVE));
    await p.ctx.close();
  });
});

describe('Casos de donación', () => {
  it('CF-09 crear un caso abre su detalle con los datos del donante', async () => {
    const p = await sesion();
    await crearCaso(p, { nombres: 'María', apellidos: 'Gómez (sintético)' });
    await texto(p, 'Caso de María Gómez (sintético)');
    await texto(p, 'BORRADOR');
    await foto(p, 'cf-09-detalle-del-caso');
    await p.ctx.close();
  });

  it('CF-10 el formulario de caso valida el documento y los nombres', async () => {
    const p = await sesion();
    const campos = await p.$$('form input');
    await campos[0].type('ab');
    await clic(p, 'Crear caso');
    await texto(p, 'De 4 a 20 letras o números');
    await texto(p, 'Este campo es obligatorio');
    assert.equal(ruta(p), '/casos');
    await foto(p, 'cf-10-validacion-formulario');
    await p.ctx.close();
  });

  it('CF-11 el caso creado aparece en la lista con estado BORRADOR y permanece tras recargar', async () => {
    const p = await sesion();
    const doc = await crearCaso(p);
    await clic(p, '← Volver a los casos');
    await esperarRuta(p, /^\/casos$/);
    await texto(p, doc);
    await p.reload({ waitUntil: 'networkidle0' });
    await texto(p, doc);
    assert.ok(await p.$$eval('table tbody tr', (r, d) => r.some((x) => x.innerText.includes(d) && x.innerText.includes('BORRADOR')), doc));
    await p.ctx.close();
  });

  it('CF-12 desde la lista se puede abrir un caso', async () => {
    const p = await sesion();
    const doc = await crearCaso(p);
    await clic(p, '← Volver a los casos');
    await texto(p, doc);
    await p.$$eval('table tbody tr', (r, d) => r.find((x) => x.innerText.includes(d))?.querySelector('button, a')?.click(), doc);
    await esperarRuta(p, /^\/casos\/[0-9a-f-]{36}$/);
    await texto(p, 'Caso de');
    await p.ctx.close();
  });

  it('CF-13 el mismo donante en dos casos genera dos casos en la lista', async () => {
    const p = await sesion();
    const doc = await crearCaso(p);
    await clic(p, '← Volver a los casos');
    await esperarRuta(p, /^\/casos$/);
    await crearCaso(p, { documento: doc });
    await clic(p, '← Volver a los casos');
    await texto(p, doc);
    const cantidad = await p.$$eval('table tbody tr', (r, d) => r.filter((x) => x.innerText.includes(d)).length, doc);
    assert.equal(cantidad, 2);
    await p.ctx.close();
  });

  it('CF-14 abrir un caso que no existe muestra «Caso no encontrado»', async () => {
    const p = await sesion();
    await p.goto(`${p.base}/casos/00000000-0000-4000-8000-000000000000`, { waitUntil: 'networkidle0' });
    await texto(p, 'Caso no encontrado');
    await p.ctx.close();
  });

  it('CF-15 abrir una dirección con un identificador inválido muestra un error y no se queda cargando', async () => {
    const p = await sesion();
    await p.goto(`${p.base}/casos/esto-no-es-un-uuid`, { waitUntil: 'networkidle0' });
    await noTexto(p, 'Cargando…', 8000);
    await p.ctx.close();
  });
});

describe('Historia clínica externa', () => {
  it('CF-16 «Usar ejemplo sintético» rellena el área de texto', async () => {
    const { p } = await conCaso();
    await clic(p, 'Usar ejemplo sintético');
    const valor = await p.$eval('textarea', (t) => t.value);
    assert.match(valor, /Diagnóstico principal: Traumatismo craneoencefálico severo/);
    await p.ctx.close();
  });

  it('CF-17 registrar el texto lo agrega a la lista de documentos', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await texto(p, 'historia-pegada.txt');
    await foto(p, 'cf-17-historia-registrada');
    await p.ctx.close();
  });

  it('CF-18 registrar un texto vacío muestra el mensaje de validación', async () => {
    const { p } = await conCaso();
    await clic(p, 'Registrar texto');
    await texto(p, 'Escriba o pegue la historia clínica');
    await p.ctx.close();
  });

  it('CF-19 cargar un archivo .txt lo registra', async () => {
    const { p } = await conCaso();
    const f = archivoTemporal('historia.txt', 'Diagnóstico principal: TCE severo\nGrupo sanguíneo: O+');
    await (await p.$('input[type=file]')).uploadFile(f);
    await texto(p, 'Archivo cargado:');
    await texto(p, 'historia.txt');
    await p.ctx.close();
  });

  it('CF-20 cargar un archivo .pdf lo registra', async () => {
    const { p } = await conCaso();
    await (await p.$('input[type=file]')).uploadFile(PDF_EJEMPLO);
    await texto(p, 'Archivo cargado:');
    await texto(p, 'historia_clinica_sintetica.pdf');
    await p.ctx.close();
  });

  it('CF-21 un archivo de tipo no permitido (.exe) se rechaza con un mensaje y no se registra', async () => {
    const { p } = await conCaso();
    const f = archivoTemporal('malo.exe', 'MZ-contenido-falso');
    await (await p.$('input[type=file]')).uploadFile(f);
    await texto(p, 'Solo se aceptan archivos .pdf o .txt');
    assert.ok(!(await hay(p, 'malo.exe')));
    await foto(p, 'cf-21-archivo-no-permitido');
    await p.ctx.close();
  });

  it('CF-22 un archivo de más de 5 MB se rechaza con un mensaje de error', async () => {
    const { p } = await conCaso();
    const f = archivoTemporal('grande.txt', Buffer.alloc(5 * 1024 * 1024 + 10, 'a'));
    await (await p.$('input[type=file]')).uploadFile(f);
    await p.waitForFunction(() => /large|grande|tamaño/i.test(document.body.innerText), { timeout: 15000 });
    assert.ok(!(await hay(p, 'grande.txt')));
    await p.ctx.close();
  });
});

describe('Extracción con IA (simulador determinista)', () => {
  it('CF-23 sin una historia clínica registrada no se puede extraer', async () => {
    const { p } = await conCaso();
    await texto(p, 'Registre o seleccione una historia clínica primero.');
    const deshabilitado = await p.$eval('button::-p-text(Extraer con IA)', (b) => b.disabled);
    assert.equal(deshabilitado, true);
    await p.ctx.close();
  });

  it('CF-24 extraer muestra la extracción PROCESADA con sus 5 sugerencias y el proveedor usado', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'Valor sugerido');
    await texto(p, 'PROCESADA');
    await texto(p, 'MOCK');
    assert.equal(await filas(p), 5);
    await foto(p, 'cf-24-extraccion-procesada');
    await p.ctx.close();
  });

  it('CF-25 la confianza se muestra como porcentaje y se advierte que la declara el modelo', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, '95 %');
    await texto(p, 'la declara el modelo');
    await p.ctx.close();
  });

  it('CF-26 aceptar una sugerencia la marca como ACEPTADA', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'Valor sugerido');
    await clic(p, 'Aceptar');
    await texto(p, 'ACEPTADA');
    await p.ctx.close();
  });

  it('CF-27 modificar exige escribir un valor y deja la sugerencia como MODIFICADA con ese valor', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'Valor sugerido');
    assert.equal(await p.$eval('button::-p-text(Modificar)', (b) => b.disabled), true);
    await p.type('input[placeholder="Valor corregido"]', 'Valor corregido por el coordinador');
    assert.equal(await p.$eval('button::-p-text(Modificar)', (b) => b.disabled), false);
    await clic(p, 'Modificar');
    await texto(p, 'MODIFICADA');
    await texto(p, 'Valor corregido por el coordinador');
    await p.ctx.close();
  });

  it('CF-28 rechazar una sugerencia la marca como RECHAZADA', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'Valor sugerido');
    await clic(p, 'Rechazar');
    await texto(p, 'RECHAZADA');
    await p.ctx.close();
  });

  it('CF-29 las decisiones se conservan al recargar la página (persisten en la base de datos)', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'Valor sugerido');
    await clic(p, 'Aceptar'); await texto(p, 'ACEPTADA');
    await clic(p, 'Rechazar'); await texto(p, 'RECHAZADA');
    await foto(p, 'cf-29-revision-humana');
    await p.reload({ waitUntil: 'networkidle0' });
    await texto(p, 'ACEPTADA');
    await texto(p, 'RECHAZADA');
    await p.ctx.close();
  });

  it('CF-30 un texto sin datos reconocibles termina en ABSTENCION y pide captura manual', async () => {
    const { p } = await conCaso();
    await p.type('textarea', 'Paciente estable. Sin novedades relevantes en el turno.');
    await clic(p, 'Registrar texto');
    await texto(p, 'Historia clínica registrada.');
    await clic(p, 'Extraer con IA');
    await texto(p, 'ABSTENCION');
    await texto(p, 'Sin sugerencias: capture los datos manualmente.');
    await foto(p, 'cf-30-abstencion');
    await p.ctx.close();
  });

  it('CF-31 se pueden pedir dos extracciones seguidas y ambas quedan en el historial del caso', async () => {
    const { p } = await conCaso();
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'PROCESADA');
    await clic(p, 'Extraer con IA');
    await p.waitForFunction(() => (document.body.innerText.match(/PROCESADA/g) ?? []).length >= 2, { timeout: 10000 });
    await p.ctx.close();
  });
});

describe('Falla del proveedor de IA (backend con el proveedor caído; el resto es real)', () => {
  it('CF-32 cuando el proveedor falla, la extracción queda PENDIENTE y el documento se conserva', async () => {
    const { p } = await conCaso(UI_FALLA);
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'PENDIENTE', 20000);
    await texto(p, 'no respondió');
    await texto(p, '2 intento(s)');
    await texto(p, 'Sin sugerencias: capture los datos manualmente.');
    assert.ok(await hay(p, 'historia-pegada.txt'));
    await foto(p, 'cf-32-ia-caida-pendiente');
    await p.ctx.close();
  });

  it('CF-33 tras la falla de la IA el usuario puede seguir trabajando (registrar otra historia)', async () => {
    const { p } = await conCaso(UI_FALLA);
    await registrarEjemplo(p);
    await clic(p, 'Extraer con IA');
    await texto(p, 'PENDIENTE', 20000);
    await p.$eval('textarea', (t) => { t.value = ''; });
    await p.type('textarea', 'Diagnóstico principal: otra historia');
    await clic(p, 'Registrar texto');
    await texto(p, 'Historia clínica registrada.');
    await p.ctx.close();
  });
});

describe('Idioma de la interfaz', () => {
  it('CF-34 cambiar el idioma a inglés traduce la interfaz y se conserva al recargar', async () => {
    const p = await sesion();
    await p.select('select[aria-label]', 'en');
    await noTexto(p, 'Casos de donación');
    const enIngles = await p.evaluate(() => document.body.innerText);
    assert.ok(!enIngles.includes('Cerrar sesión'));
    await foto(p, 'cf-34-ingles');
    await p.reload({ waitUntil: 'networkidle0' });
    assert.ok(!(await hay(p, 'Casos de donación')));
    await p.select('select[aria-label]', 'es');
    await texto(p, 'Casos de donación');
    await p.ctx.close();
  });
});
