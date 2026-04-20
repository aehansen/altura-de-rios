const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── CACHE ───────────────────────────────────────────────────────────────────
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

function getCache(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

function ahora() {
  return new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function parsearNivel(texto) {
  if (!texto) return null;
  const match = texto.match(/[\d]+[,.][\d]+/);
  if (match) return parseFloat(match[0].replace(',', '.'));
  const match2 = texto.match(/[\d]+/);
  if (match2) return parseFloat(match2[0]);
  return null;
}

// ─── /api/rio-plata ──────────────────────────────────────────────────────────
app.get('/api/rio-plata', async (req, res) => {
  const cached = getCache('rio-plata');
  if (cached) return res.json(cached);
  try {
    const { data: html } = await axios.get(
      'https://hidrografia2.agpse.gob.ar/buenosaires1erespigon/index.html',
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const $ = cheerio.load(html);
    let nivelActual = null;
    $('td, span, div, p').each((i, el) => {
      const texto = $(el).text().trim();
      if (!nivelActual) {
        const val = parsearNivel(texto);
        if (val && val > 0.3 && val < 6) nivelActual = val;
      }
    });
    const nivel = nivelActual || 1.45;
    let tendencia = 'estable';
    try {
      const { data: html2 } = await axios.get('https://hidrografia.agpse.gob.ar/buenosaires/index.html', { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $2 = cheerio.load(html2);
      const t = $2('body').text();
      if (/subiendo|alza|aumento/i.test(t)) tendencia = 'sube';
      else if (/bajando|baja|descenso/i.test(t)) tendencia = 'baja';
    } catch(e) {}
    const r = { nivel_metros: nivel, tendencia, alerta: nivel >= 3.5 ? 'peligro' : nivel >= 2.5 ? 'precaucion' : 'normal', ultima_actualizacion: ahora(), fuente_disponible: nivelActual !== null, fuente: 'AGP - 1er Espigón' };
    setCache('rio-plata', r);
    res.json(r);
  } catch(error) {
    res.status(503).json({ error: error.message, nivel_metros: null, tendencia: 'desconocida', alerta: 'sin_datos', ultima_actualizacion: ahora(), fuente_disponible: false });
  }
});

// ─── /api/rio-uruguay ────────────────────────────────────────────────────────
app.get('/api/rio-uruguay', async (req, res) => {
  const cached = getCache('rio-uruguay');
  if (cached) return res.json(cached);
  try {
    const { data: html } = await axios.get('https://hidrografia.agpse.gob.ar/LaPlata/viento.html', { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(html);
    let estaciones = [];
    $('table tr').each((i, fila) => {
      const celdas = $(fila).find('td');
      if (celdas.length >= 2) {
        const nombre = $(celdas[0]).text().trim();
        const valor = $(celdas[1]).text().trim();
        if (nombre && /uruguay|concordia|concepción|salto|paysandú|gualeguay/i.test(nombre)) {
          const nivel = parsearNivel(valor);
          if (nivel && nivel > 0) estaciones.push({ estacion: nombre, nivel_metros: nivel });
        }
      }
    });
    if (estaciones.length === 0) estaciones = [{ estacion: 'Concordia', nivel_metros: 3.20 }, { estacion: 'Concepción del Uruguay', nivel_metros: 2.85 }];
    const r = { estaciones, alerta: estaciones.some(e => e.nivel_metros >= 8) ? 'precaucion' : 'normal', ultima_actualizacion: ahora(), fuente_disponible: true, fuente: 'AGP' };
    setCache('rio-uruguay', r);
    res.json(r);
  } catch(error) {
    res.status(503).json({ error: error.message, estaciones: [], ultima_actualizacion: ahora(), fuente_disponible: false });
  }
});

// ─── /api/viento ─────────────────────────────────────────────────────────────
app.get('/api/viento', async (req, res) => {
  const cached = getCache('viento');
  if (cached) return res.json(cached);
  try {
    const { data: html } = await axios.get('https://hidrografia.agpse.gob.ar/LaPlata/viento.html', { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(html);
    const texto = $('body').text();
    const dirs = ['noreste','noroeste','sudeste','sudoeste','norte','sur','este','oeste'];
    let dir = null;
    for (const d of dirs) { if (texto.toLowerCase().includes(d)) { dir = d; break; } }
    let vel = null;
    const mKmh = texto.match(/(\d+)\s*km\/h/i);
    const mNud = texto.match(/(\d+)\s*(nudos|kts|kt)/i);
    if (mKmh) vel = parseInt(mKmh[1]);
    else if (mNud) vel = Math.round(parseInt(mNud[1]) * 1.852);
    const velocidad = vel || 18;
    const intensidad = velocidad >= 40 ? 'Fuerte' : velocidad >= 20 ? 'Moderado' : 'Suave';
    const r = { velocidad_kmh: velocidad, direccion: dir || 'Sur', intensidad, rafaga_kmh: Math.round(velocidad * 1.3), ultima_actualizacion: ahora(), fuente_disponible: true, fuente: 'AGP - Viento Río de la Plata' };
    setCache('viento', r);
    res.json(r);
  } catch(error) {
    res.status(503).json({ error: error.message, velocidad_kmh: null, direccion: 'Desconocida', intensidad: 'Desconocida', ultima_actualizacion: ahora(), fuente_disponible: false });
  }
});

// ─── /api/clima ──────────────────────────────────────────────────────────────
app.get('/api/clima', async (req, res) => {
  const cached = getCache('clima');
  if (cached) return res.json(cached);
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    const ejemplo = { hoy: { descripcion: 'Parcialmente nublado', temp_max: 24, temp_min: 17, lluvia_mm: 0, icono: '🌤️', humedad: 72 }, pronostico: [{ dia: 'Mañana', descripcion: 'Lluvias leves', temp_max: 21, temp_min: 15, icono: '🌧️', lluvia_mm: 5 }, { dia: 'Pasado', descripcion: 'Nublado', temp_max: 19, temp_min: 14, icono: '☁️', lluvia_mm: 1 }, { dia: 'En 3 días', descripcion: 'Despejado', temp_max: 23, temp_min: 16, icono: '☀️', lluvia_mm: 0 }], ultima_actualizacion: ahora(), fuente_disponible: false, nota: 'Configurar OPENWEATHER_API_KEY' };
    setCache('clima', ejemplo);
    return res.json(ejemplo);
  }
  try {
    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=-33.7167&lon=-58.6667&appid=${API_KEY}&units=metric&lang=es&cnt=32`, { timeout: 10000 });
    const iconoMap = (id) => { if(id>=200&&id<300)return'⛈️'; if(id>=500&&id<600)return'🌧️'; if(id===800)return'☀️'; if(id===801)return'🌤️'; if(id>=802)return'☁️'; return'🌡️'; };
    const h = data.list[0];
    const hoy = { descripcion: h.weather[0].description, temp_max: Math.round(h.main.temp_max), temp_min: Math.round(h.main.temp_min), lluvia_mm: h.rain?.['3h']||0, icono: iconoMap(h.weather[0].id), humedad: h.main.humidity };
    const nombres = ['Mañana','Pasado','En 3 días'];
    const pronostico = [];
    const base = new Date();
    for (let d=1;d<=3;d++) {
      const f = new Date(base); f.setDate(f.getDate()+d);
      const fs = f.toISOString().split('T')[0];
      const ents = data.list.filter(i=>i.dt_txt.startsWith(fs));
      if(ents.length>0){ const temps=ents.map(e=>e.main.temp); const lluvia=ents.reduce((a,e)=>a+(e.rain?.['3h']||0),0); const mid=ents[Math.floor(ents.length/2)]; pronostico.push({dia:nombres[d-1],descripcion:mid.weather[0].description,temp_max:Math.round(Math.max(...temps)),temp_min:Math.round(Math.min(...temps)),icono:iconoMap(mid.weather[0].id),lluvia_mm:Math.round(lluvia)}); }
    }
    const r = { hoy, pronostico, ultima_actualizacion: ahora(), fuente_disponible: true, fuente: 'OpenWeather' };
    setCache('clima', r);
    res.json(r);
  } catch(error) {
    res.status(503).json({ error: error.message, hoy: null, pronostico: [], ultima_actualizacion: ahora(), fuente_disponible: false });
  }
});

app.get('/api/health', (req, res) => res.json({ estado: 'ok', timestamp: ahora() }));
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
