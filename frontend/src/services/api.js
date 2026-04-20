// URL del backend - cambiar por la URL real en producción
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchEndpoint(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return response.json();
}

export async function getRioPlata() { return fetchEndpoint('/api/rio-plata'); }
export async function getRioUruguay() { return fetchEndpoint('/api/rio-uruguay'); }
export async function getViento() { return fetchEndpoint('/api/viento'); }
export async function getClima() { return fetchEndpoint('/api/clima'); }

export async function getAllData() {
  const [rioPlata, rioUruguay, viento, clima] = await Promise.allSettled([
    getRioPlata(), getRioUruguay(), getViento(), getClima()
  ]);
  return {
    rioPlata: rioPlata.status === 'fulfilled' ? rioPlata.value : null,
    rioUruguay: rioUruguay.status === 'fulfilled' ? rioUruguay.value : null,
    viento: viento.status === 'fulfilled' ? viento.value : null,
    clima: clima.status === 'fulfilled' ? clima.value : null,
    errores: {
      rioPlata: rioPlata.status === 'rejected' ? rioPlata.reason?.message : null,
      rioUruguay: rioUruguay.status === 'rejected' ? rioUruguay.reason?.message : null,
      viento: viento.status === 'rejected' ? viento.reason?.message : null,
      clima: clima.status === 'rejected' ? clima.reason?.message : null,
    }
  };
}
