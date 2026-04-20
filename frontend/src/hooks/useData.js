import { useState, useEffect, useCallback } from 'react';
import { getAllData } from '../services/api';

const STORAGE_KEY = 'rio-paranacito-last-data';
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useData() {
  const [data, setData] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllData();
      setData(result);
      setLastUpdate(new Date());
      setIsOffline(false);
      saveToStorage(result);
    } catch (err) {
      const cached = loadFromStorage();
      if (cached) {
        setData(cached);
        setIsOffline(true);
      } else {
        setError('No se pudo conectar al servidor');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, lastUpdate, isOffline, refresh: fetchData };
}
