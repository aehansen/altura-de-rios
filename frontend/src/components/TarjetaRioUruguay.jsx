import React from 'react';
import { Tarjeta } from './Tarjeta';

export function TarjetaRioUruguay({ datos, cargando }) {
  if (!datos) return (
    <Tarjeta titulo="Río Uruguay" icono="🌊" cargando={cargando} />
  );

  const estacionesConDatos = datos.estaciones?.filter(e => e.altura_metros !== null) || [];
  const sinDatos = estacionesConDatos.length === 0;

  return (
    <Tarjeta
      titulo="Río Uruguay"
      icono="🌊"
      valor={sinDatos ? 'Consultando...' : null}
      valorSecundario={datos.resumen}
      ultimaActualizacion={datos.ultima_actualizacion}
      cargando={cargando}
    >
      {datos.estaciones?.map((est, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            fontSize: '20px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{est.nombre}</span>
          <span style={{ color: 'white', fontWeight: '700' }}>
            {est.altura_metros !== null ? `${est.altura_metros.toFixed(2)} m` : '---'}
          </span>
        </div>
      ))}
    </Tarjeta>
  );
}
