const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
// Villa Paranacito, Entre Ríos, Argentina
const LAT = -33.7167;
const LON = -58.6667;

async function getClimaVillaParanacito() {
  if (!OPENWEATHER_API_KEY) {
    console.warn("OPENWEATHER_API_KEY no configurada - usando datos de ejemplo");
    return getMockClima();
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: { lat: LAT, lon: LON, appid: OPENWEATHER_API_KEY, units: "metric", lang: "es" },
        timeout: 8000
      }),
      axios.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: { lat: LAT, lon: LON, appid: OPENWEATHER_API_KEY, units: "metric", lang: "es" },
        timeout: 8000
      })
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data;

    // Agrupar pronóstico por día (próximos 3 días)
    const diasMap = {};
    forecast.list.forEach(item => {
      const fecha = item.dt_txt.split(" ")[0];
      if (!diasMap[fecha]) diasMap[fecha] = [];
      diasMap[fecha].push(item);
    });

    const dias = Object.entries(diasMap).slice(1, 4).map(([fecha, items]) => {
      const temps = items.map(i => i.main.temp);
      const desc = items[Math.floor(items.length / 2)].weather[0].description;
      const icon = items[Math.floor(items.length / 2)].weather[0].icon;
      return {
        fecha,
        temp_max: Math.round(Math.max(...temps)),
        temp_min: Math.round(Math.min(...temps)),
        descripcion: capitalizar(desc),
        icono: icon
      };
    });

    return {
      fuente: "OpenWeatherMap",
      ubicacion: "Villa Paranacito, Entre Ríos",
      hoy: {
        temperatura: Math.round(current.main.temp),
        sensacion_termica: Math.round(current.main.feels_like),
        humedad: current.main.humidity,
        descripcion: capitalizar(current.weather[0].description),
        icono: current.weather[0].icon,
        viento_kmh: Math.round(current.wind.speed * 3.6),
        presion_hpa: current.main.pressure
      },
      pronostico_3dias: dias
    };
  } catch (err) {
    console.error("Error obteniendo clima:", err.message);
    return getMockClima();
  }
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getMockClima() {
  const hoy = new Date();
  return {
    fuente: "Datos de ejemplo (configure OPENWEATHER_API_KEY)",
    ubicacion: "Villa Paranacito, Entre Ríos",
    hoy: {
      temperatura: 22,
      sensacion_termica: 21,
      humedad: 75,
      descripcion: "Parcialmente nublado",
      icono: "02d",
      viento_kmh: 18,
      presion_hpa: 1013
    },
    pronostico_3dias: [1, 2, 3].map(d => {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + d);
      return {
        fecha: fecha.toISOString().split("T")[0],
        temp_max: 24 + d,
        temp_min: 15 + d,
        descripcion: ["Lluvias leves", "Parcialmente nublado", "Cielo despejado"][d - 1],
        icono: ["10d", "02d", "01d"][d - 1]
      };
    })
  };
}

module.exports = { getClimaVillaParanacito };
