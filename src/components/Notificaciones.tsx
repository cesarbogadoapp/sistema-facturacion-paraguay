// src/components/Notificaciones.tsx
import React from 'react';
import { Notificacion } from '../hooks/useNotificaciones';

interface NotificacionesProps {
  notificaciones: Notificacion[];
  onOcultar: (id: string) => void;
}

const Notificaciones: React.FC<NotificacionesProps> = ({ 
  notificaciones, 
  onOcultar 
}) => {
  if (notificaciones.length === 0) {
    return null;
  }

  // Función para obtener el icono según el tipo
  const obtenerIcono = (tipo: string): string => {
    switch (tipo) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  // Función para obtener los colores según el tipo
  const obtenerClaseTipo = (tipo: string): string => {
    switch (tipo) {
      case 'success':
        return 'notificacion-success';
      case 'error':
        return 'notificacion-error';
      case 'warning':
        return 'notificacion-warning';
      case 'info':
      default:
        return 'notificacion-info';
    }
  };

  return (
    <div className="notificaciones-container">
      {notificaciones.map((notificacion) => (
        <div
          key={notificacion.id}
          className={`notificacion ${obtenerClaseTipo(notificacion.tipo)}`}
        >
          <div className="notificacion-contenido">
            <span className="notificacion-icono">
              {obtenerIcono(notificacion.tipo)}
            </span>
            <span className="notificacion-mensaje">
              {notificacion.mensaje}
            </span>
          </div>
          <button
            className="notificacion-cerrar"
            onClick={() => onOcultar(notificacion.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}

      <style>{`
        .notificaciones-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          width: 100%;
        }

        .notificacion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
          backdrop-filter: blur(10px);
          border: 1px solid transparent;
        }

        .notificacion-success {
          background: rgba(16, 185, 129, 0.95);
          color: white;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .notificacion-error {
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .notificacion-warning {
          background: rgba(245, 158, 11, 0.95);
          color: white;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .notificacion-info {
          background: rgba(59, 130, 246, 0.95);
          color: white;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .notificacion-contenido {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .notificacion-icono {
          font-size: 1.25rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .notificacion-mensaje {
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .notificacion-cerrar {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background-color 0.2s;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .notificacion-cerrar:hover {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .notificaciones-container {
            top: 0.5rem;
            right: 0.5rem;
            left: 0.5rem;
            max-width: none;
          }

          .notificacion {
            padding: 0.75rem;
          }

          .notificacion-mensaje {
            font-size: 0.8rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notificacion {
            animation: none;
          }
        }

        /* Soporte para modo oscuro */
        @media (prefers-color-scheme: dark) {
          .notificacion {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default Notificaciones;