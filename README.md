# 🌊 Río Paranacito — Info en tiempo real

Aplicación web accesible (PWA) para consultar datos del río y clima, optimizada para adultos mayores con temblores en manos y visión reducida.

---

## 📁 Estructura del proyecto

```
rio-paranacito/
├── backend/           ← API Node.js (Render / Railway)
│   ├── src/server.js
│   ├── package.json
│   └── .env.example
└── frontend/          ← Sitio estático (GitHub Pages)
    ├── index.html
    └── public/
        ├── manifest.json
        └── sw.js
```

---

## ⚙️ BACKEND — Deploy en Render (gratis)

### 1. Subir a GitHub
```bash
cd backend
git init
git add .
git commit -m "Backend inicial"
git remote add origin https://github.com/TU_USUARIO/rio-backend.git
git push -u origin main
```

### 2. Crear servicio en Render
1. Ir a https://render.com → New → Web Service
2. Conectar tu repositorio
3. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Agregar variable de entorno:
   - `OPENWEATHER_API_KEY` = tu clave de https://openweathermap.org/api (gratis)
5. Deploy → Copiar la URL (ej: `https://rio-backend.onrender.com`)

### Endpoints disponibles:
- `GET /api/rio-plata` — Nivel actual del Río de la Plata
- `GET /api/rio-uruguay` — Alturas en la cuenca del Uruguay
- `GET /api/viento` — Viento en el Río de la Plata
- `GET /api/clima` — Pronóstico Villa Paranacito (3 días)
- `GET /api/health` — Estado del servidor

---

## 🖥️ FRONTEND — Deploy en GitHub Pages

### 1. Editar la URL del backend
En `frontend/index.html`, cambiar:
```js
const API_BASE = 'https://TU-BACKEND-URL.onrender.com'; // ← CAMBIAR ESTO
```

### 2. Subir a GitHub
```bash
cd frontend
git init
git add .
git commit -m "Frontend inicial"
git remote add origin https://github.com/TU_USUARIO/rio-paranacito.git
git push -u origin main
```

### 3. Activar GitHub Pages
1. Repositorio → Settings → Pages
2. Source: `main` branch, carpeta raíz `/`
3. Guardar → URL: `https://TU_USUARIO.github.io/rio-paranacito`

---

## 📱 Instalar como app en tablet Android
1. Abrir la URL en Chrome
2. Tocar el menú (⋮) → "Agregar a pantalla de inicio"
3. ¡Listo! Funciona como app nativa

---

## 🌦️ Respuestas JSON de ejemplo

### /api/rio-plata
```json
{
  "nivel_metros": 1.85,
  "tendencia": "sube",
  "alerta": "normal",
  "ultima_actualizacion": "20/04/2026, 14:30:00",
  "fuente_disponible": true,
  "fuente": "AGP - 1er Espigón"
}
```

### /api/rio-uruguay
```json
{
  "estaciones": [
    { "estacion": "Concordia", "nivel_metros": 3.20 },
    { "estacion": "Concepción del Uruguay", "nivel_metros": 2.85 }
  ],
  "alerta": "normal",
  "ultima_actualizacion": "20/04/2026, 14:30:00"
}
```

### /api/viento
```json
{
  "velocidad_kmh": 22,
  "direccion": "sudeste",
  "intensidad": "Moderado",
  "rafaga_kmh": 29,
  "ultima_actualizacion": "20/04/2026, 14:30:00"
}
```

### /api/clima
```json
{
  "hoy": {
    "descripcion": "Parcialmente nublado",
    "temp_max": 24,
    "temp_min": 17,
    "lluvia_mm": 0,
    "icono": "🌤️",
    "humedad": 72
  },
  "pronostico": [
    { "dia": "Mañana", "descripcion": "Lluvias leves", "temp_max": 21, "temp_min": 15, "icono": "🌧️", "lluvia_mm": 5 },
    { "dia": "Pasado", "descripcion": "Nublado", "temp_max": 19, "temp_min": 14, "icono": "☁️", "lluvia_mm": 1 },
    { "dia": "En 3 días", "descripcion": "Despejado", "temp_max": 23, "temp_min": 16, "icono": "☀️", "lluvia_mm": 0 }
  ],
  "ultima_actualizacion": "20/04/2026, 14:30:00"
}
```

---

## ♿ Características de accesibilidad
- Fuente **Atkinson Hyperlegible** (diseñada para baja visión)
- Botones ≥ 76px de alto
- Tipografía base 22px
- Alto contraste (WCAG AA)
- Lectura por voz con Web Speech API (español argentino)
- Modo offline con caché local
- Auto-actualización cada 5 minutos
- Sin scroll innecesario
- Targets táctiles grandes y espaciados
