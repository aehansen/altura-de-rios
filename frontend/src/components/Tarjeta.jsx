import React from 'react';

export function Tarjeta({ titulo, icono, valor, valorSecundario, tendencia, ultimaActualizacion, alerta, children, cargando, error }) {
  const tendenciaInfo = {
    sube: { icono: '↑', texto: 'Subiendo', color: '#ff9500' },
    baja: { icono: '↓', texto: 'Bajando', color: '#34aadc' },
    estable: { icono: '→', texto: 'Estable', color: '#4cd964' },
    alta: { icono: '⚠', texto: 'Nivel alto', color: '#ff3b30' },
    normal: { icono: '✓', texto: 'Normal', color: '#4cd964' },
    baja_nivel: { icono: '↓', texto: 'Nivel bajo', color: '#34aadc' },
  };

  const tendObj = tendenciaInfo[tendencia] || null;

  const alertaColores = {
    rojo: { bg: '#ff3b30', texto: 'white' },
    amarillo: { bg: '#ffcc00', texto: '#1a1a1a' },
    azul: { bg: '#34aadc', texto: 'white' },
  };

  const alertaColor = alerta ? alertaColores[alerta.nivel] : null;

  return (
    <div
      role="region"
      aria-label={titulo}
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        border: alerta ? `3px solid ${alertaColor?.bg}` : '2px solid rgba(255,255,255,0.15)',
        borderRadius: '20px',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '36px', lineHeight: 1 }} aria-hidden="true">{icono}</span>
        <span style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.02em',
        }}>
          {titulo}
        </span>
      </div>

      {/* Alerta */}
      {alerta && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            background: alertaColor?.bg,
            color: alertaColor?.texto,
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '18px',
            fontWeight: '700',
          }}
        >
          {alerta.mensaje}
        </div>
      )}

      {/* Estado de carga / error */}
      {cargando && (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', padding: '8px 0' }}>
          <span aria-live="polite">Actualizando...</span>
        </div>
      )}
      {error && (
        <div style={{ color: '#ff9500', fontSize: '20px' }} role="alert">
          Sin conexión - mostrando últimos datos
        </div>
      )}

      {/* Valor principal */}
      {valor && (
        <div style={{
          fontSize: '38px',
          fontWeight: '700',
          color: 'white',
          lineHeight: 1.1,
          marginTop: '4px',
        }}>
          {valor}
        </div>
      )}

      {/* Valor secundario */}
      {valorSecundario && (
        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>
          {valorSecundario}
        </div>
      )}

      {/* Tendencia */}
      {tendObj && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: `${tendObj.color}22`,
          border: `2px solid ${tendObj.color}`,
          borderRadius: '50px',
          padding: '6px 16px',
          fontSize: '20px',
          color: tendObj.color,
          fontWeight: '700',
          alignSelf: 'flex-start',
        }}>
          <span aria-hidden="true">{tendObj.icono}</span>
          <span>{tendObj.texto}</span>
        </div>
      )}

      {/* Contenido adicional */}
      {children}

      {/* Última actualización */}
      {ultimaActualizacion && (
        <div style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '8px',
        }}>
          Actualizado: {formatearFecha(ultimaActualizacion)}
        </div>
      )}
    </div>
  );
}

function formatearFecha(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
