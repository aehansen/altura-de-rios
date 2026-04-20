import React from 'react';
import { Tarjeta } from './Tarjeta';

export function TarjetaRioPlata({ datos, cargando }) {
  if (!datos) return (
    <Tarjeta titulo="Río de la Plata" icono="🌊" cargando={cargando} />
  );

  const tendenciaMap = {
    alta: 'alta',
    normal: 'normal',
    baja: 'baja_nivel',
    desconocida: 'estable'
  };

  return (
    <Tarjeta
      titulo="Río de la Plata"
      icono="🌊"
      valor={datos.altura_metros ? `${datos.altura_metros.toFixed(2)} m` : 'Sin datos'}
      valorSecundario={datos.estacion_principal}
      tendencia={tendenciaMap[datos.tendencia] || 'estable'}
      ultimaActualizacion={datos.ultima_actualizacion}
      alerta={datos.alerta}
      cargando={cargando}
    />
  );
}
