// ─── UTILIDAD DE LECTURA POR VOZ ──────────────────────────────────────────────

export function buildSpeechText({ rioPlata, rioUruguay, viento, clima }) {
  const partes = [];

  // Encabezado
  partes.push('Información actualizada del río y clima.');
  partes.push('');

  // Río de la Plata
  if (rioPlata?.altura_m !== null && rioPlata?.altura_m !== undefined) {
    const metros = Math.floor(rioPlata.altura_m);
    const cm = Math.round((rioPlata.altura_m - metros) * 100);
    const tendStr = rioPlata.tendencia === 'sube' ? 'y está subiendo'
      : rioPlata.tendencia === 'baja' ? 'y está bajando'
      : 'y está estable';
    partes.push(`Río de la Plata: ${metros} metro${metros !== 1 ? 's' : ''} con ${cm} centímetros, ${tendStr}.`);
  } else {
    partes.push('Río de la Plata: datos no disponibles.');
  }

  // Río Uruguay
  if (rioUruguay?.estaciones?.length > 0) {
    const est = rioUruguay.estaciones.filter(e => e.altura_m !== null);
    if (est.length > 0) {
      const textos = est.map(e => {
        const metros = Math.floor(e.altura_m);
        const cm = Math.round((e.altura_m - metros) * 100);
        return `${e.nombre}: ${metros} metro${metros !== 1 ? 's' : ''} con ${cm} centímetros`;
      });
      partes.push(`Río Uruguay. ${textos.join('. ')}.`);
    } else {
      partes.push('Río Uruguay: datos no disponibles.');
    }
  }

  // Viento
  if (viento?.velocidad_kmh !== null && viento?.velocidad_kmh !== undefined) {
    const dir = viento.direccion ? `del ${viento.direccion}` : '';
    partes.push(`Viento ${dir} a ${viento.velocidad_kmh} kilómetros por hora, intensidad ${viento.intensidad || 'moderada'}.`);
  } else {
    partes.push('Viento: datos no disponibles.');
  }

  // Clima
  if (clima?.temperatura_c !== undefined) {
    partes.push(`Clima en Villa Paranacito: ${clima.temperatura_c} grados, ${clima.descripcion || ''}.`);
    if (clima.pronostico_3dias?.length > 0) {
      const pron = clima.pronostico_3dias[0];
      partes.push(`Pronóstico para mañana: mínima de ${pron.temp_min} grados y máxima de ${pron.temp_max} grados. ${pron.descripcion}.`);
    }
  } else {
    partes.push('Clima: datos no disponibles.');
  }

  partes.push('');
  partes.push('Fin de la información.');

  return partes.join(' ');
}

export function speak(text, { rate = 0.85, pitch = 1, onEnd } = {}) {
  if (!window.speechSynthesis) return false;

  // Cancelar cualquier lectura previa
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-AR';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;

  // Preferir voz en español argentino
  const voices = window.speechSynthesis.getVoices();
  const voiceAR = voices.find(v => v.lang === 'es-AR')
    || voices.find(v => v.lang.startsWith('es'));
  if (voiceAR) utterance.voice = voiceAR;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false;
}
