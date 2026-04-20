import React from 'react';
import { Tarjeta } from './Tarjeta';

const ICONO_DIRECCION = {
  N: '⬆', NNE: '↗', NE: '↗', ENE: '→',
  E: '→', ESE: '↘', SE: '↘', SSE: '⬇',
  S: '⬇', SSO: '↙', SO: '↙', OSO: '←',
  O: '←', ONO: '↖', NO: '↖', NNO: '⬆'
};

export function TarjetaViento({ datos, cargando }) {
  if (!datos) return (
    <Tarjeta titulo="Viento" icono="💨" cargando={cargando} />
  );

  const iconoDir = datos.direccion_codigo
    ? (ICONO_DIRECCION[datos.direccion_codigo.toUpperCase()] || '💨')
    : '';

  const velocidadDisplay = datos.velocidad_kmh
    ? `${Math.round(datos.velocidad_kmh)} km/h`
    : 'Sin datos';

  return (
    <Tarjeta
      titulo="Viento"
      icono={datos.icon || '💨'}
      valor={velocidadDisplay}
      valorSecundario={
        datos.direccion_texto
          ? `${iconoDir} ${datos.direccion_texto}`
          : undefined
      }
      tendencia={null}
      ultimaActualizacion={datos.ultima_actualizacion}
      cargando={cargando}
    >
      {datos.rafaga_kmh && (
        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>
          Ráfagas hasta <strong style={{ color: '#ff9500' }}>{Math.round(datos.rafaga_kmh)} km/h</strong>
        </div>
      )}
      {datos.intensidad_texto && (
        <div style={{
          fontSize: '22px',
          fontWeight: '600',
          color: datos.intensidad === 'muy_fuerte' ? '#ff3b30' : 'rgba(255,255,255,0.75)'
        }}>
          {datos.intensidad_texto}
        </div>
      )}
    </Tarjeta>
  );
}
