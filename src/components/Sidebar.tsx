// src/components/Sidebar.tsx - CON ICONOS SVG PROFESIONALES
import React from 'react';

type TipoVista = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';

interface SidebarProps {
  seccionActiva: TipoVista;
  onCambiarSeccion: (seccion: TipoVista) => void;
  abierto?: boolean;
  onToggle?: () => void;
  usuario?: any;
  onCerrarSesion?: () => void;
}

// Iconos SVG profesionales
const IconoDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconoSolicitudes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const IconoClientes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconoProductos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  seccionActiva, 
  onCambiarSeccion, 
  abierto = true,
  onToggle,
  usuario,
  onCerrarSesion
}) => {
  const secciones: Array<{
    id: TipoVista, 
    nombre: string, 
    icono: React.ReactElement,
    descripcion: string
  }> = [
    { 
      id: 'dashboard', 
      nombre: 'Dashboard', 
      icono: <IconoDashboard />,
      descripcion: 'Panel principal y estadísticas'
    },
    { 
      id: 'solicitudes', 
      nombre: 'Solicitudes', 
      icono: <IconoSolicitudes />,
      descripcion: 'Gestión de solicitudes de facturación'
    },
    { 
      id: 'clientes', 
      nombre: 'Clientes', 
      icono: <IconoClientes />,
      descripcion: 'Administración de clientes'
    },
    { 
      id: 'productos', 
      nombre: 'Productos', 
      icono: <IconoProductos />,
      descripcion: 'Catálogo de productos'
    }
  ];

  return (
    <div className={`sidebar ${abierto ? 'sidebar-abierto' : 'sidebar-cerrado'}`}>
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="logo-text">
            <h2>Sistema</h2>
            <span>Facturación PY</span>
          </div>
        </div>
        
        {onToggle && (
          <button 
            onClick={onToggle}
            className="btn-toggle"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">MENÚ PRINCIPAL</span>
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              onClick={() => onCambiarSeccion(seccion.id)}
              className={`nav-item ${seccionActiva === seccion.id ? 'nav-item-activo' : ''}`}
              title={seccion.descripcion}
            >
              <div className="nav-item-icon">
                {seccion.icono}
              </div>
              <div className="nav-item-content">
                <span className="nav-item-nombre">{seccion.nombre}</span>
                <span className="nav-item-descripcion">{seccion.descripcion}</span>
              </div>
              <div className="nav-item-indicator"></div>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="sidebar-footer">
        <div className="footer-info">
          {/* Información del usuario */}
            <div className="footer-usuario">
              <div className="usuario-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="usuario-info">
                  <span className="usuario-nombre">
                    {usuario?.displayName || usuario?.email?.split('@')[0] || 'Usuario'}
                  </span>
                  <span className="usuario-email">{usuario?.email || 'usuario@email.com'}</span>
                </div>
              </div>
    
            {/* Botón de cerrar sesión */}
            {onCerrarSesion && (
              <button onClick={onCerrarSesion} className="btn-logout" title="Cerrar Sesión">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar Sesión
              </button>
            )}

            <div className="footer-version">
              <span className="version-label">Versión</span>
              <span className="version-number">1.0.0</span>
            </div>
            <div className="footer-status">
              <div className="status-indicator"></div>
              <span>Sistema Operativo</span>
            </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
          border-right: 1px solid #334155;
        }

        .sidebar-cerrado {
          transform: translateX(-100%);
        }

        .sidebar-abierto {
          transform: translateX(0);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #334155;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .logo-text h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }

        .logo-text span {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .btn-toggle {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-toggle:hover {
          background: rgba(148, 163, 184, 0.1);
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-section {
          padding: 0 1rem;
        }

        .nav-section-title {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          display: block;
          padding: 0 0.75rem;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.875rem 0.75rem;
          margin-bottom: 0.25rem;
          background: none;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          color: #cbd5e1;
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05));
          opacity: 0;
          transition: opacity 0.2s;
        }

        .nav-item:hover::before {
          opacity: 1;
        }

        .nav-item:hover {
          color: white;
          background: rgba(59, 130, 246, 0.08);
          transform: translateX(4px);
        }

        .nav-item-activo {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(29, 78, 216, 0.1));
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .nav-item-activo::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(180deg, #3b82f6, #1d4ed8);
          border-radius: 0 2px 2px 0;
        }

        .nav-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          background: rgba(148, 163, 184, 0.1);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .nav-item:hover .nav-item-icon {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .nav-item-activo .nav-item-icon {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .nav-item-content {
          flex: 1;
          min-width: 0;
        }

        .nav-item-nombre {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.25;
          margin-bottom: 0.125rem;
        }

        .nav-item-descripcion {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-item:hover .nav-item-descripcion {
          color: #94a3b8;
        }

        .nav-item-activo .nav-item-descripcion {
          color: #94a3b8;
        }

        .nav-item-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: transparent;
          margin-left: 0.5rem;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .nav-item-activo .nav-item-indicator {
          background: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #334155;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-version {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .version-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .version-number {
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 600;
          background: rgba(59, 130, 246, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Scrollbar personalizado */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 280px;
          }
          
          .nav-item-descripcion {
            display: none;
          }
          
          .nav-item {
            padding: 0.75rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .sidebar {
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar,
          .nav-item,
          .btn-toggle {
            transition: none;
          }
          
          .status-indicator {
            animation: none;
          }
        }
        
        .footer-usuario {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #334155;
        }

        .usuario-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          }

        .usuario-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 0;
          flex: 1;
        }

        .usuario-nombre {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .usuario-email {
          font-size: 0.75rem;
          color: #94a3b8;
          white-space: nowrap;  
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .footer-usuario {
          padding: 0.5rem;
        }
  
        .usuario-info {
          gap: 0;
        }
  
        .usuario-nombre {
          font-size: 0.8rem;
        }
  
        .usuario-email {
          font-size: 0.7rem;
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .btn-logout:active {
          transform: translateY(0);
        }
      }

      `}</style>
    </div>
  );
};

export default Sidebar;