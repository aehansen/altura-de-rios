import React from 'react';
import { Tarjeta } from './Tarjeta';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getIconoClima(icono, descripcion) {
  if (!descripcion) return '🌡️';
  const d = descripcion.toLowerCase();
  if (d.includes('lluvia') || d.includes('llovizna')) return '🌧️';
  if (d.includes('tormenta')) return '⛈️';
  if (d.includes('nieve')) return '❄️';
  if (d.includes('niebla') || d.includes('neblina')) return '🌫️';
  if (d.includes('despejado') || d.includes('soleado')) return '☀️';
  if (d.includes('nublado') || d.includes('nubes')) return '☁️';
  if (d.includes('parcial')) return '⛅';
  return '🌡️';
}

function formatearDia(fechaStr) {
  try {
    const d = new Date(fechaStr + 'T12:00:00');
    return DIAS_SEMANA[d.getDay()];
  } catch { return '---'; }
}

export function TarjetaClima({ datos, cargando }) {
  if (!datos) return (
    <Tarjeta titulo="Clima - Villa Paranacito" icono="🌦️" cargando={cargando} />
  );

  const hoy = datos.hoy;

  return (
    <Tarjeta
      titulo="Clima - Villa Paranacito"
      icono="🌦️"
      valor={hoy ? `${hoy.temperatura}°C` : 'Sin datos'}
      valorSecundario={hoy?.descripcion}
      ultimaActualizacion={datos.ultima_actualizacion}
      cargando={cargando}
    >
      {hoy && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '19px', color: 'rgba(255,255,255,0.7)' }}>
          <span>💧 {hoy.humedad}%</span>
          <span>💨 {hoy.viento_kmh} km/h</span>
          <span>🌡️ ST: {hoy.sensacion_termica}°C</span>
        </div>
      )}

      {/* Pronóstico 3 días */}
      {datos.pronostico_3dias?.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginTop: '8px',
        }}>
          {datos.pronostico_3dias.map((dia, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px 8px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                {formatearDia(dia.fecha)}
              </div>
              <div style={{ fontSize: '28px' }}>
                {getIconoClima(dia.icono, dia.descripcion)}
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                {dia.temp_max}°
              </div>
              <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)' }}>
                {dia.temp_min}°
              </div>
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}
