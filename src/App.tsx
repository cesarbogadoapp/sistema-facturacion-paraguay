// src/App.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Solicitudes from './components/Solicitudes';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import Notificaciones from './components/Notificaciones';
import { useNotificaciones } from './hooks/useNotificaciones';
import './App.css';

// Tipos para las vistas disponibles
type TipoVista = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';

// Interfaces para los props de los componentes
interface PropsComponente {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

function App() {
  const [vistaActual, setVistaActual] = useState<TipoVista>('dashboard');
  const [sidebarAbierto, setSidebarAbierto] = useState<boolean>(true);
  const { notificaciones, mostrarNotificacion, ocultarNotificacion } = useNotificaciones();

  // Manejar redimensionamiento de ventana para responsividad
  useEffect(() => {
    const manejarResize = () => {
      if (window.innerWidth < 768) {
        setSidebarAbierto(false);
      } else {
        setSidebarAbierto(true);
      }
    };

    // Establecer estado inicial
    manejarResize();

    // Agregar listener
    window.addEventListener('resize', manejarResize);

    // Cleanup
    return () => window.removeEventListener('resize', manejarResize);
  }, []);

  // Función para cambiar vista
  const cambiarVista = (nuevaVista: TipoVista) => {
    setVistaActual(nuevaVista);
    
    // Cerrar sidebar en móvil después de seleccionar
    if (window.innerWidth < 768) {
      setSidebarAbierto(false);
    }
  };

  // Función para toggle del sidebar
  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  // Renderizar componente actual
  const renderizarVista = () => {
  const props = { mostrarNotificacion };

  switch (vistaActual) {
    case 'dashboard':
      return <Dashboard {...props} onCambiarVista={cambiarVista} />;
    case 'solicitudes':
      return <Solicitudes {...props} />;
    case 'clientes':
      return <Clientes {...props} />;
    case 'productos':
      return <Productos {...props} />;
    default:
      return <Dashboard {...props} onCambiarVista={cambiarVista} />;
  }
};

  return (
    <div className="app">
      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarAbierto && window.innerWidth < 768 && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        seccionActiva={vistaActual}
        onCambiarSeccion={cambiarVista}
        abierto={sidebarAbierto}
        onToggle={toggleSidebar}
      />

      {/* Contenido principal */}
      <main className={`main-content ${sidebarAbierto ? 'sidebar-abierto' : 'sidebar-cerrado'}`}>
        {/* Header móvil */}
        <div className="header-movil">
          <button 
            className="btn-menu-movil"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M3 12H21M3 6H21M3 18H21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="titulo-movil">Sistema de Facturación</h1>
        </div>

        {/* Vista actual */}
        <div className="vista-contenido">
          {renderizarVista()}
        </div>
      </main>

      {/* Sistema de notificaciones */}
      <Notificaciones 
        notificaciones={notificaciones}
        onOcultar={ocultarNotificacion}
      />

      {/* Estilos CSS */}
      <style>{`
        .app {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          min-width: 0;
        }

        .main-content.sidebar-abierto {
          margin-left: 280px;
        }

        .main-content.sidebar-cerrado {
          margin-left: 0;
        }

        .header-movil {
          display: none;
          align-items: center;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .btn-menu-movil {
          background: none;
          border: none;
          color: #374151;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s;
          margin-right: 1rem;
        }

        .btn-menu-movil:hover {
          background: #f3f4f6;
        }

        .titulo-movil {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .vista-contenido {
          flex: 1;
          overflow-y: auto;
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .main-content.sidebar-abierto {
            margin-left: 0;
          }

          .header-movil {
            display: flex;
          }
        }

        .main-content {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vista-contenido {
          contain: layout style paint;
        }

        @media (prefers-color-scheme: dark) {
          .app {
            background: #111827;
          }
          
          .header-movil {
            background: #1f2937;
            border-bottom-color: #374151;
          }
          
          .titulo-movil {
            color: #f9fafb;
          }
          
          .btn-menu-movil {
            color: #d1d5db;
          }
          
          .btn-menu-movil:hover {
            background: #374151;
          }
          
          .vista-contenido {
            background: #111827;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .main-content,
          .btn-menu-movil {
            transition: none;
          }
        }

        .btn-menu-movil:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        @media print {
          .sidebar-overlay,
          .header-movil {
            display: none;
          }
          
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;