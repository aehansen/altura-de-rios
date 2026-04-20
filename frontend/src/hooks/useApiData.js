import { useState, useEffect, useCallback } from 'react';

// Cambiar por la URL de tu backend desplegado
const API_BASE = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com';

const CACHE_KEY_PREFIX = 'rioparanacito_';
const OFFLINE_TTL = 60 * 60 * 1000; // 1 hora para cache offline

function saveOffline(key, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({ data, saved: Date.now() }));
  } catch (e) {}
}

function loadOffline(key) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.saved > OFFLINE_TTL) return null;
    return parsed.data;
  } catch (e) { return null; }
}

export function useApiData(endpoint) {
  const [data, setData] = useState(() => loadOffline(endpoint));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
      setOffline(false);
      saveOffline(endpoint, json);
    } catch (err) {
      const cached = loadOffline(endpoint);
      if (cached) {
        setData(cached);
        setOffline(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [fetch_]);

  return { data, loading, error, offline, refresh: fetch_ };
}
