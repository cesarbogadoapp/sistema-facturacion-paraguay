// src/App.tsx - INTEGRADO CON SÚPER ELIMINADOR
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Solicitudes from './components/Solicitudes';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import AdminDelete from './components/AdminDelete';
import Notificaciones from './components/Notificaciones';
import { useNotificaciones } from './hooks/useNotificaciones';

// Tipos para las vistas disponibles
type TipoVista = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';

// Interfaces para los props de los componentes
interface PropsComponente {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

function App() {
  const [vistaActual, setVistaActual] = useState<TipoVista>('dashboard');
  const [sidebarAbierto, setSidebarAbierto] = useState<boolean>(true);
  const [mostrarAdminDelete, setMostrarAdminDelete] = useState<boolean>(false);
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

  // Manejar combinación de teclas para abrir Admin Delete (Ctrl + Shift + D)
  useEffect(() => {
    const manejarTeclas = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setMostrarAdminDelete(true);
        mostrarNotificacion('Modo Administrador activado', 'warning');
      }
    };

    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [mostrarNotificacion]);

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
          
          {/* Botón Admin Delete en header móvil */}
          <button
            className="btn-admin-delete-movil"
            onClick={() => setMostrarAdminDelete(true)}
            title="Administrador de Eliminación (Ctrl+Shift+D)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>

        {/* Vista actual */}
        <div className="vista-contenido">
          {renderizarVista()}
        </div>
      </main>

      {/* Botón flotante Admin Delete (solo desktop) */}
      <button
        className="btn-admin-delete-flotante"
        onClick={() => setMostrarAdminDelete(true)}
        title="Administrador de Eliminación (Ctrl+Shift+D)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>

      {/* Modal Admin Delete */}
      <AdminDelete
        mostrar={mostrarAdminDelete}
        onCerrar={() => setMostrarAdminDelete(false)}
        mostrarNotificacion={mostrarNotificacion}
      />

      {/* Sistema de notificaciones */}
      <Notificaciones 
        notificaciones={notificaciones}
        onOcultar={ocultarNotificacion}
      />

      {/* Estilos CSS - MEJORADOS CON MODALES CENTRADOS */}
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
          justify-content: space-between;
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
        }

        .btn-menu-movil:hover {
          background: #f3f4f6;
        }

        .titulo-movil {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          flex: 1;
          text-align: center;
        }

        .btn-admin-delete-movil {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-admin-delete-movil:hover {
          background: #fef2f2;
          transform: scale(1.05);
        }

        .vista-contenido {
          flex: 1;
          overflow-y: auto;
          background: #f8fafc;
        }

        /* Botón flotante Admin Delete - Solo desktop */
        .btn-admin-delete-flotante {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-admin-delete-flotante:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 35px rgba(239, 68, 68, 0.4);
        }

        .btn-admin-delete-flotante:active {
          transform: translateY(0) scale(0.95);
        }

        /* SOLUCIÓN UNIVERSAL PARA MODALES CENTRADOS */
        .modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 9999 !important;
          padding: 1rem !important;
          overflow-y: auto !important;
        }

        .modal-content {
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          max-width: 90vw !important;
          max-height: 90vh !important;
          width: auto !important;
          overflow-y: auto !important;
          margin: auto !important;
          position: relative !important;
        }

        /* Para FormularioSolicitud específicamente */
        .overlay-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0, 0, 0, 0.6) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 1000 !important;
          padding: 1rem !important;
        }

        .contenido-modal {
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          max-width: 700px !important;
          width: 100% !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          margin: auto !important;
          position: relative !important;
        }

        /* Animaciones suaves para modales */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-content,
        .contenido-modal {
          animation: modalFadeIn 0.2s ease-out !important;
        }

        @media (max-width: 768px) {
          .main-content.sidebar-abierto {
            margin-left: 0;
          }

          .header-movil {
            display: flex;
          }

          .btn-admin-delete-flotante {
            display: none;
          }

          /* Modales en móvil */
          .modal-overlay,
          .overlay-modal {
            padding: 0.5rem !important;
          }

          .modal-content,
          .contenido-modal {
            max-width: 95vw !important;
            max-height: 95vh !important;
            margin: 0 !important;
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
          .btn-menu-movil,
          .btn-admin-delete-flotante {
            transition: none;
          }
          
          .modal-content,
          .contenido-modal {
            animation: none !important;
          }
        }

        .btn-menu-movil:focus,
        .btn-admin-delete-movil:focus,
        .btn-admin-delete-flotante:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        @media print {
          .sidebar-overlay,
          .header-movil,
          .btn-admin-delete-flotante {
            display: none;
          }
          
          .main-content {
            margin-left: 0 !important;
          }
        }

        /* Prevenir scroll del body cuando modal está abierto */
        .modal-open {
          overflow: hidden !important;
        }

        /* Para navegadores que soportan backdrop-filter */
        @supports (backdrop-filter: blur(8px)) {
          .modal-overlay,
          .overlay-modal {
            backdrop-filter: blur(8px) !important;
            background: rgba(0, 0, 0, 0.4) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;