const express = require("express");
const router = express.Router();
const { withCache } = require("../utils/cache");
const { getClimaVillaParanacito } = require("../services/weather");

router.get("/", async (req, res) => {
  try {
    const data = await withCache("clima", async () => {
      const clima = await getClimaVillaParanacito();
      return {
        ...clima,
        ultima_actualizacion: new Date().toISOString(),
        fromCache: false
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo datos del clima" });
  }
});

module.exports = router;
