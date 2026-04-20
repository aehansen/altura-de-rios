import React, { useState } from 'react';
import './App.css';
import { useData } from './hooks/useData';
import { useSpeech, generarTextoLectura } from './hooks/useSpeech';
import { TarjetaRioPlata } from './components/TarjetaRioPlata';
import { TarjetaRioUruguay } from './components/TarjetaRioUruguay';
import { TarjetaViento } from './components/TarjetaViento';
import { TarjetaClima } from './components/TarjetaClima';

export default function App() {
  const { data, loading, error, lastUpdate, isOffline, refresh } = useData();
  const { hablar, hablando } = useSpeech();
  const [actualizando, setActualizando] = useState(false);

  const handleActualizar = async () => {
    setActualizando(true);
    await refresh();
    setTimeout(() => setActualizando(false), 1000);
  };

  const handleHablar = () => {
    const texto = generarTextoLectura(data);
    hablar(texto);
  };

  const formatHora = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px 16px 40px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>

      {/* ENCABEZADO */}
      <header style={{
        textAlign: 'center',
        paddingTop: '8px',
        paddingBottom: '4px',
      }}>
        <div style={{
          fontSize: '44px',
          marginBottom: '4px',
          filter: 'drop-shadow(0 2px 8px rgba(79, 195, 247, 0.4))',
        }}>
          🌊
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'white',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}>
          Río y Clima
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '4px',
        }}>
          Villa Paranacito
        </p>

        {/* Indicadores de estado */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '12px',
          flexWrap: 'wrap',
        }}>
          {isOffline && (
            <span style={{
              background: 'rgba(255, 149, 0, 0.2)',
              border: '2px solid #ff9500',
              color: '#ff9500',
              borderRadius: '50px',
              padding: '6px 16px',
              fontSize: '17px',
              fontWeight: '600',
            }}>
              📶 Sin conexión - Datos guardados
            </span>
          )}
          {lastUpdate && (
            <span style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '17px',
            }}>
              ⏱ Actualizado: {formatHora(lastUpdate)}
            </span>
          )}
          {(loading || actualizando) && (
            <span
              className="pulse"
              style={{ color: '#4fc3f7', fontSize: '17px' }}
              aria-live="polite"
            >
              ⟳ Actualizando...
            </span>
          )}
        </div>
      </header>

      {/* BOTONES PRINCIPALES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
      }}>
        {/* Botón escuchar */}
        <button
          onClick={handleHablar}
          aria-label={hablando ? 'Detener lectura' : 'Escuchar información en voz alta'}
          style={{
            background: hablando
              ? 'linear-gradient(135deg, #ff3b30, #c0392b)'
              : 'linear-gradient(135deg, #1a7fe8, #0d5cb6)',
            border: 'none',
            borderRadius: '16px',
            padding: '20px 16px',
            color: 'white',
            fontSize: '20px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            minHeight: '72px',
            boxShadow: hablando
              ? '0 4px 20px rgba(255,59,48,0.4)'
              : '0 4px 20px rgba(26,127,232,0.4)',
          }}
        >
          <span style={{ fontSize: '28px' }}>{hablando ? '⏹' : '🔊'}</span>
          <span>{hablando ? 'Detener' : 'Escuchar'}</span>
        </button>

        {/* Botón actualizar */}
        <button
          onClick={handleActualizar}
          disabled={loading || actualizando}
          aria-label="Actualizar todos los datos ahora"
          style={{
            background: 'linear-gradient(135deg, #00b894, #00916e)',
            border: 'none',
            borderRadius: '16px',
            padding: '20px 16px',
            color: 'white',
            fontSize: '20px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            minHeight: '72px',
            opacity: (loading || actualizando) ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(0,184,148,0.4)',
          }}
        >
          <span style={{
            fontSize: '28px',
            display: 'inline-block',
            animation: (loading || actualizando) ? 'spin 1s linear infinite' : 'none',
          }}>
            🔄
          </span>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Error general */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'rgba(255,59,48,0.15)',
            border: '2px solid #ff3b30',
            borderRadius: '16px',
            padding: '20px',
            fontSize: '20px',
            color: '#ff9b94',
            textAlign: 'center',
          }}
        >
          ⚠️ {error}. Verifique su conexión a internet.
        </div>
      )}

      {/* TARJETAS PRINCIPALES */}
      <main
        aria-label="Información del río y clima"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
        }}
      >
        <div className="fade-in" style={{ animationDelay: '0ms' }}>
          <TarjetaRioPlata datos={data?.rioPlata} cargando={loading && !data?.rioPlata} />
        </div>
        <div className="fade-in" style={{ animationDelay: '80ms' }}>
          <TarjetaViento datos={data?.viento} cargando={loading && !data?.viento} />
        </div>
        <div className="fade-in" style={{ animationDelay: '160ms' }}>
          <TarjetaClima datos={data?.clima} cargando={loading && !data?.clima} />
        </div>
        <div className="fade-in" style={{ animationDelay: '240ms' }}>
          <TarjetaRioUruguay datos={data?.rioUruguay} cargando={loading && !data?.rioUruguay} />
        </div>
      </main>

      {/* PIE */}
      <footer style={{
        textAlign: 'center',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '15px',
        paddingTop: '8px',
        lineHeight: 1.6,
      }}>
        <p>Datos: AGP Hidrografía · OpenWeatherMap</p>
        <p>Actualización automática cada 5 minutos</p>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
