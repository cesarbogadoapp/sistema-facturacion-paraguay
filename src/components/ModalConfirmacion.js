import React from 'react';

// Iconos SVG
const IconoPregunta = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"/>
  </svg>
);

const IconoAdvertencia = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
  </svg>
);

const IconoEliminar = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
  </svg>
);

const ModalConfirmacion = ({ 
  visible, 
  tipo = 'pregunta', // 'pregunta', 'advertencia', 'eliminar'
  titulo, 
  mensaje, 
  textoConfirmar = 'Confirmar', 
  textoCancelar = 'Cancelar',
  onConfirmar, 
  onCancelar,
  cargando = false
}) => {
  if (!visible) return null;

  const obtenerEstilos = () => {
    switch (tipo) {
      case 'advertencia':
        return {
          iconoColor: '#d97706',
          iconoBg: '#fffbeb',
          botonColor: '#d97706',
          botonBg: '#f59e0b'
        };
      case 'eliminar':
        return {
          iconoColor: '#dc2626',
          iconoBg: '#fef2f2',
          botonColor: '#dc2626',
          botonBg: '#ef4444'
        };
      default: // pregunta
        return {
          iconoColor: '#2563eb',
          iconoBg: '#eff6ff',
          botonColor: '#2563eb',
          botonBg: '#3b82f6'
        };
    }
  };

  const obtenerIcono = () => {
    switch (tipo) {
      case 'advertencia': return <IconoAdvertencia />;
      case 'eliminar': return <IconoEliminar />;
      default: return <IconoPregunta />;
    }
  };

  const estilos = obtenerEstilos();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Icono */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: estilos.iconoBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: estilos.iconoColor
          }}>
            {obtenerIcono()}
          </div>
        </div>

        {/* Contenido */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 0.75rem 0'
          }}>
            {titulo}
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            margin: 0
          }}>
            {mensaje}
          </p>
        </div>

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: cargando ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!cargando) {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseOut={(e) => {
              if (!cargando) {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
          >
            {textoCancelar}
          </button>
          
          <button
            onClick={onConfirmar}
            disabled={cargando}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: cargando ? '#9ca3af' : estilos.botonBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '100px'
            }}
            onMouseOver={(e) => {
              if (!cargando) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (!cargando) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ModalConfirmacion;