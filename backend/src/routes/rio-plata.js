const express = require("express");
const router = express.Router();
const { withCache } = require("../utils/cache");
const { scrapeRioPlata, scrapeRioPlataBA } = require("../services/scraper");

router.get("/", async (req, res) => {
  try {
    const data = await withCache("rio-plata", async () => {
      const [espigon, buenosAires] = await Promise.allSettled([
        scrapeRioPlata(),
        scrapeRioPlataBA()
      ]);

      const espigonData = espigon.status === "fulfilled" ? espigon.value : { error: "No disponible" };
      const baData = buenosAires.status === "fulfilled" ? buenosAires.value : { error: "No disponible" };

      // Usar el mejor dato disponible
      const alturaFinal = espigonData.altura_metros || baData.altura_metros;
      
      return {
        estacion_principal: "Buenos Aires - 1er Espigón",
        altura_metros: alturaFinal,
        altura_texto: alturaFinal
          ? formatAltura(alturaFinal)
          : "Sin datos",
        tendencia: calcularTendencia(alturaFinal),
        alerta: calcularAlerta(alturaFinal),
        detalles: {
          espigon: espigonData,
          buenos_aires: baData
        },
        ultima_actualizacion: new Date().toISOString(),
        fromCache: false
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo datos del Río de la Plata" });
  }
});

function formatAltura(metros) {
  const m = Math.floor(metros);
  const cm = Math.round((metros - m) * 100);
  return cm > 0
    ? `${m} metro${m !== 1 ? "s" : ""} ${cm} centímetro${cm !== 1 ? "s" : ""}`
    : `${m} metro${m !== 1 ? "s" : ""}`;
}

function calcularTendencia(altura) {
  if (!altura) return "desconocida";
  if (altura > 2.5) return "alta";
  if (altura < 0.5) return "baja";
  return "normal";
}

function calcularAlerta(altura) {
  if (!altura) return null;
  if (altura >= 3.5) return { nivel: "rojo", mensaje: "Nivel muy alto - Posibles inundaciones" };
  if (altura >= 2.8) return { nivel: "amarillo", mensaje: "Nivel elevado - Precaución" };
  if (altura <= 0.2) return { nivel: "azul", mensaje: "Nivel muy bajo - Bajante pronunciada" };
  return null;
}

module.exports = router;
