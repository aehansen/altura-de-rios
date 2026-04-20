import { useCallback, useRef, useState } from 'react';

export function useSpeech() {
  const [hablando, setHablando] = useState(false);
  const utteranceRef = useRef(null);

  const hablar = useCallback((texto) => {
    if (!window.speechSynthesis) {
      alert('Tu dispositivo no tiene lectura de voz disponible.');
      return;
    }

    // Detener si ya está hablando
    if (hablando) {
      window.speechSynthesis.cancel();
      setHablando(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Dividir en oraciones para lectura más natural
    const partes = texto.split('. ').filter(Boolean);
    let indice = 0;

    const hablarParte = () => {
      if (indice >= partes.length) {
        setHablando(false);
        return;
      }

      const u = new SpeechSynthesisUtterance(partes[indice] + '.');
      utteranceRef.current = u;

      // Preferir voz en español argentino
      const voces = window.speechSynthesis.getVoices();
      const vozAR = voces.find(v => v.lang === 'es-AR') ||
                    voces.find(v => v.lang === 'es-419') ||
                    voces.find(v => v.lang.startsWith('es'));
      if (vozAR) u.voice = vozAR;

      u.lang = 'es-AR';
      u.rate = 0.85;   // Más lento y claro
      u.pitch = 1.0;
      u.volume = 1.0;

      u.onend = () => {
        indice++;
        hablarParte();
      };
      u.onerror = () => setHablando(false);

      window.speechSynthesis.speak(u);
    };

    setHablando(true);
    hablarParte();
  }, [hablando]);

  const detener = useCallback(() => {
    window.speechSynthesis?.cancel();
    setHablando(false);
  }, []);

  return { hablar, detener, hablando };
}

export function generarTextoLectura(data) {
  if (!data) return 'No hay datos disponibles en este momento.';

  const partes = [];

  if (data.rioPlata) {
    const rp = data.rioPlata;
    if (rp.altura_texto) {
      partes.push(`Altura del Río de la Plata: ${rp.altura_texto}`);
    }
    if (rp.alerta) {
      partes.push(`Atención: ${rp.alerta.mensaje}`);
    }
  }

  if (data.viento) {
    const v = data.viento;
    if (v.velocidad_kmh && v.direccion_texto) {
      partes.push(`Viento del ${v.direccion_texto} a ${v.velocidad_texto}`);
    } else if (v.velocidad_kmh) {
      partes.push(`Viento a ${v.velocidad_texto}`);
    }
  }

  if (data.clima?.hoy) {
    const c = data.clima.hoy;
    partes.push(
      `Clima en Villa Paranacito: ${c.temperatura} grados, ${c.descripcion}. Humedad ${c.humedad} por ciento`
    );
  }

  if (data.clima?.pronostico_3dias?.length > 0) {
    const p = data.clima.pronostico_3dias[0];
    if (p) {
      partes.push(
        `Pronóstico para mañana: entre ${p.temp_min} y ${p.temp_max} grados. ${p.descripcion}`
      );
    }
  }

  if (partes.length === 0) return 'Los datos se están actualizando. Intente nuevamente en unos momentos.';
  
  return partes.join('. ') + '.';
}
