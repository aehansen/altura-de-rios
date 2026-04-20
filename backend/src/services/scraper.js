const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; RioParanacito/1.0)",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function fetchHtml(url) {
  const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
  return cheerio.load(response.data);
}

// Scrape Río de la Plata (Buenos Aires, 1er Espigón)
async function scrapeRioPlata() {
  try {
    const $ = await fetchHtml("https://hidrografia2.agpse.gob.ar/buenosaires1erespigon/index.html");
    
    // Buscar tablas con datos de altura
    let altura = null;
    let tendencia = "estable";
    let horaMedicion = null;
    
    $("table tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        if (label.includes("nivel") || label.includes("altura") || label.includes("cota")) {
          const num = parseFloat(value.replace(",", "."));
          if (!isNaN(num)) altura = num;
        }
        if (label.includes("hora") || label.includes("fecha")) {
          horaMedicion = value;
        }
      }
    });

    // Fallback: buscar cualquier número que parezca altura de río (0.5 - 5.0 m)
    if (!altura) {
      $("td, span, div").each((i, el) => {
        const text = $(el).text().trim();
        const match = text.match(/^\d+[,.]\d+$/);
        if (match) {
          const num = parseFloat(match[0].replace(",", "."));
          if (num >= 0.1 && num <= 6.0) {
            altura = num;
            return false;
          }
        }
      });
    }

    return {
      fuente: "AGP - Buenos Aires 1er Espigón",
      altura_metros: altura,
      tendencia: tendencia,
      hora_medicion: horaMedicion,
      url: "https://hidrografia2.agpse.gob.ar/buenosaires1erespigon/index.html"
    };
  } catch (err) {
    console.error("Error scraping Río de la Plata:", err.message);
    return { fuente: "AGP", altura_metros: null, error: err.message };
  }
}

// Scrape Río de la Plata principal (Buenos Aires)
async function scrapeRioPlataBA() {
  try {
    const $ = await fetchHtml("https://hidrografia.agpse.gob.ar/buenosaires/index.html");
    
    let altura = null;
    let tendencia = "estable";

    $("table tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        if (label.includes("nivel") || label.includes("altura") || label.includes("cota") || label.includes("lectura")) {
          const num = parseFloat(value.replace(",", "."));
          if (!isNaN(num) && num >= 0.1 && num <= 6.0) altura = num;
        }
      }
    });

    if (!altura) {
      const bodyText = $("body").text();
      const matches = bodyText.match(/\b[0-2]\.[0-9]{2}\b/g);
      if (matches && matches.length > 0) {
        altura = parseFloat(matches[0]);
      }
    }

    return {
      fuente: "AGP - Buenos Aires",
      altura_metros: altura,
      tendencia: tendencia,
      url: "https://hidrografia.agpse.gob.ar/buenosaires/index.html"
    };
  } catch (err) {
    console.error("Error scraping Río de la Plata BA:", err.message);
    return { fuente: "AGP BA", altura_metros: null, error: err.message };
  }
}

// Scrape viento
async function scrapeViento() {
  try {
    const $ = await fetchHtml("https://hidrografia.agpse.gob.ar/LaPlata/viento.html");
    
    let velocidad = null;
    let direccion = null;
    let rafaga = null;

    $("table tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        
        if (label.includes("velocidad") || label.includes("intensidad") || label.includes("fuerza")) {
          const num = parseFloat(value.replace(",", "."));
          if (!isNaN(num)) velocidad = num;
        }
        if (label.includes("direcci") || label.includes("rumbo")) {
          direccion = value;
        }
        if (label.includes("rfaga") || label.includes("rafaga") || label.includes("máximo")) {
          const num = parseFloat(value.replace(",", "."));
          if (!isNaN(num)) rafaga = num;
        }
      }
    });

    return {
      fuente: "AGP - La Plata Viento",
      velocidad_kmh: velocidad,
      direccion: direccion,
      rafaga_kmh: rafaga,
      url: "https://hidrografia.agpse.gob.ar/LaPlata/viento.html"
    };
  } catch (err) {
    console.error("Error scraping viento:", err.message);
    return { fuente: "AGP Viento", velocidad_kmh: null, error: err.message };
  }
}

module.exports = { scrapeRioPlata, scrapeRioPlataBA, scrapeViento };
