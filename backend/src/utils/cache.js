const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function getCached(key) { return cache.get(key); }
function setCache(key, value) { cache.set(key, value); }

async function withCache(key, fetchFn) {
  const cached = getCached(key);
  if (cached) {
    return { ...cached, fromCache: true };
  }
  const data = await fetchFn();
  setCache(key, data);
  return data;
}

module.exports = { getCached, setCache, withCache };
