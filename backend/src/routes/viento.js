const express = require("express");
const router = express.Router();
const { withCache } = require("../utils/cache");
const { scrapeViento } = require("../services/scraper");

const DIRECCIONES = {
  N: "Norte", NNE: "Nor-Noreste", NE: "Noreste", ENE: "Est-Noreste",
  E: "Este", ESE: "Est-Sureste", SE: "Sureste", SSE: "Sur-Sureste",
  S: "Sur", SSO: "Sur-Suroeste", SO: "Suroeste", OSO: "Oeste-Suroeste",
  O: "Oeste", ONO: "Oeste-Noroeste", NO: "Noroeste", NNO: "Nor-Noroeste"
};

router.get("/", async (req, res) => {
  try {
    const data = await withCache("viento", async () => {
      const raw = await scrapeViento();
      
      const vel = raw.velocidad_kmh;
      const dir = raw.direccion;
      
      return {
        fuente: raw.fuente || "AGP - La Plata",
        velocidad_kmh: vel,
        velocidad_texto: vel ? formatVelocidad(vel) : "Sin datos",
        direccion_codigo: dir,
        direccion_texto: dir ? (DIRECCIONES[dir.toUpperCase()] || dir) : "Sin datos",
        rafaga_kmh: raw.rafaga_kmh,
        intensidad: vel ? clasificarViento(vel) : "desconocida",
        intensidad_texto: vel ? clasificarVientoTexto(vel) : "Sin datos",
        icon: vel ? getVientoIcon(vel) : "💨",
        ultima_actualizacion: new Date().toISOString(),
        fromCache: false
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo datos de viento" });
  }
});

function formatVelocidad(v) {
  return `${Math.round(v)} kilómetros por hora`;
}

function clasificarViento(v) {
  if (v < 20) return "calma";
  if (v < 40) return "moderado";
  if (v < 60) return "fuerte";
  return "muy_fuerte";
}

function clasificarVientoTexto(v) {
  if (v < 20) return "Calma";
  if (v < 40) return "Moderado";
  if (v < 60) return "Fuerte";
  return "Muy fuerte";
}

function getVientoIcon(v) {
  if (v < 20) return "🍃";
  if (v < 40) return "💨";
  if (v < 60) return "🌬️";
  return "⚡";
}

module.exports = router;
