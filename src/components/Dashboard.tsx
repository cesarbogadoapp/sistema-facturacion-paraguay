// src/components/Dashboard.tsx - CON NAVEGACIÓN REAL
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticas } from '../services/database';
import { Estadisticas } from '../types/interfaces';
import { formatearMontoConSimbolo } from '../utils';

interface DashboardProps {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
  onCambiarVista?: (vista: 'solicitudes' | 'clientes' | 'productos') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ mostrarNotificacion, onCambiarVista }) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setCargando(true);
    setError(null);
    try {
      const stats = await obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error al cargar las estadísticas');
      mostrarNotificacion('Error al cargar las estadísticas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const obtenerMesActual = (): string => {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-PY', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  // Función para navegar a otras secciones
  const navegarA = (vista: 'solicitudes' | 'clientes' | 'productos') => {
    if (onCambiarVista) {
      onCambiarVista(vista);
      //mostrarNotificacion(`Navegando a ${vista}...`, 'info');
    } else {
      //mostrarNotificacion('Navegación no disponible', 'warning');
    }
  };

  if (cargando) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
        </div>
        <div className="error-state">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p>{error || 'Error desconocido'}</p>
          <button onClick={cargarEstadisticas} className="btn-retry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4-4.64,4.36A9,9,0,0,1,3.51,15"/>
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="dashboard-subtitle">Resumen de actividad del sistema</p>
        </div>
        <button onClick={cargarEstadisticas} className="btn-refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23,4 23,10 17,10"/>
            <polyline points="1,20 1,14 7,14"/>
            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4-4.64,4.36A9,9,0,0,1,3.51,15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{estadisticas.totalSolicitudes}</div>
            <div className="stat-label">Total Solicitudes</div>
            <div className="stat-change">Todas las solicitudes registradas</div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{estadisticas.pendientes}</div>
            <div className="stat-label">Pendientes</div>
            <div className="stat-change">Esperando emisión</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{estadisticas.emitidas}</div>
            <div className="stat-label">Emitidas</div>
            <div className="stat-change">Facturas procesadas</div>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{estadisticas.canceladas}</div>
            <div className="stat-label">Canceladas</div>
            <div className="stat-change">Solicitudes canceladas</div>
          </div>
        </div>
      </div>

      {/* Métricas del mes */}
      <div className="monthly-metrics">
        <div className="metrics-card">
          <h3>Métricas de {obtenerMesActual()}</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="metric-value">{formatearMontoConSimbolo(estadisticas.ventasMes)}</div>
                <div className="metric-label">Ventas del Mes</div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div>
                <div className="metric-value">{estadisticas.solicitudesMes}</div>
                <div className="metric-label">Solicitudes del Mes</div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
              </div>
              <div>
                <div className="metric-value">
                  {estadisticas.solicitudesMes > 0 
                    ? formatearMontoConSimbolo(Math.round(estadisticas.ventasMes / estadisticas.solicitudesMes))
                    : formatearMontoConSimbolo(0)
                  }
                </div>
                <div className="metric-label">Promedio por Solicitud</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas - CON NAVEGACIÓN REAL */}
      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          <button 
            className="action-button action-primary"
            onClick={() => navegarA('solicitudes')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nueva Solicitud</span>
          </button>

          <button 
            className="action-button action-secondary"
            onClick={() => navegarA('clientes')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>Nuevo Cliente</span>
          </button>

          <button 
            className="action-button action-tertiary"
            onClick={() => navegarA('productos')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h2 {
          color: #1f2937;
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .dashboard-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0 0;
          font-size: 1rem;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card-primary .stat-icon {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .stat-card-warning .stat-icon {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .stat-card-success .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-card-danger .stat-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0.25rem 0;
        }

        .stat-change {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .monthly-metrics {
          margin-bottom: 2rem;
        }

        .metrics-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
        }

        .metrics-card h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #f3f4f6;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .quick-actions h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s;
          text-align: left;
        }

        .action-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .action-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-secondary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .action-secondary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-tertiary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .action-tertiary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .loading-state,
        .error-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .error-icon {
          margin: 0 auto 1rem;
        }

        .btn-retry {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
          margin-top: 1rem;
        }

        .btn-retry:hover {
          background: #2563eb;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1rem;
          }

          .dashboard-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;