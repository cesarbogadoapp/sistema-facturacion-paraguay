// src/components/AdminDelete.tsx - SÚPER BOTÓN ELIMINADOR COMPLETO CON CENTRADO AUTOMÁTICO
import React, { useState, useEffect, useRef } from 'react';
import { 
  obtenerSolicitudes,
  obtenerClientes,
  obtenerProductos
} from '../services/database';
import { 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Solicitud, Cliente, Producto } from '../types/interfaces';
import { formatearMontoConSimbolo, formatearFechaHora } from '../utils';

interface AdminDeleteProps {
  mostrar: boolean;
  onCerrar: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

type TipoRegistro = 'solicitudes' | 'clientes' | 'productos';

interface RegistroUnificado {
  id: string;
  tipo: TipoRegistro;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  estado?: string;
  fecha: Date;
  datos: any;
}

const AdminDelete: React.FC<AdminDeleteProps> = ({ 
  mostrar, 
  onCerrar, 
  mostrarNotificacion 
}) => {
  // ✨ REFS PARA CENTRADO AUTOMÁTICO
  const modalPrincipalRef = useRef<HTMLDivElement>(null);
  const modalConfirmacionRef = useRef<HTMLDivElement>(null);

  const [registros, setRegistros] = useState<RegistroUnificado[]>([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroUnificado[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoRegistro | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [eliminando, setEliminando] = useState<string | null>(null);
  
  // Modal de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<boolean>(false);
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroUnificado | null>(null);

  // ✨ EFECTO PARA CENTRADO AUTOMÁTICO DEL MODAL PRINCIPAL
  useEffect(() => {
    if (mostrar) {
      setTimeout(() => {
        modalPrincipalRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 0);
    }
  }, [mostrar]);

  // ✨ EFECTO PARA CENTRADO AUTOMÁTICO DEL MODAL DE CONFIRMACIÓN
  useEffect(() => {
    if (mostrarConfirmacion) {
      setTimeout(() => {
        modalConfirmacionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 0);
    }
  }, [mostrarConfirmacion]);

  useEffect(() => {
    if (mostrar) {
      cargarTodosLosRegistros();
    }
  }, [mostrar]);

  useEffect(() => {
    filtrarRegistros();
  }, [registros, filtroTipo, busqueda]);

  const cargarTodosLosRegistros = async () => {
    setCargando(true);
    try {
      const [solicitudes, clientes, productos] = await Promise.all([
        obtenerSolicitudes(),
        obtenerClientes(),
        obtenerProductos()
      ]);

      const todosLosRegistros: RegistroUnificado[] = [
        // Solicitudes
        ...solicitudes.map(s => ({
          id: s.id!,
          tipo: 'solicitudes' as TipoRegistro,
          titulo: `Solicitud #${s.id?.slice(-8).toUpperCase()}`,
          subtitulo: s.cliente.razonSocial,
          descripcion: `${s.producto.nombre} - ${formatearMontoConSimbolo(s.monto)}`,
          estado: s.estado,
          fecha: s.fechaSolicitud?.toDate ? s.fechaSolicitud.toDate() : new Date(s.fechaSolicitud),
          datos: s
        })),
        
        // Clientes
        ...clientes.map(c => ({
          id: c.id!,
          tipo: 'clientes' as TipoRegistro,
          titulo: c.razonSocial,
          subtitulo: `RUC: ${c.ruc}`,
          descripcion: c.email,
          fecha: c.fechaCreacion?.toDate ? c.fechaCreacion.toDate() : new Date(c.fechaCreacion),
          datos: c
        })),
        
        // Productos
        ...productos.map(p => ({
          id: p.id!,
          tipo: 'productos' as TipoRegistro,
          titulo: p.nombre,
          subtitulo: 'Producto',
          descripcion: `Creado: ${formatearFechaHora(p.fechaCreacion)}`,
          fecha: p.fechaCreacion?.toDate ? p.fechaCreacion.toDate() : new Date(p.fechaCreacion),
          datos: p
        }))
      ];

      // Ordenar por fecha descendente
      todosLosRegistros.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      
      setRegistros(todosLosRegistros);
    } catch (error) {
      console.error('Error cargando registros:', error);
      mostrarNotificacion('Error al cargar los registros', 'error');
    } finally {
      setCargando(false);
    }
  };

  const filtrarRegistros = () => {
    let registrosFiltrados = registros;

    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      registrosFiltrados = registrosFiltrados.filter(r => r.tipo === filtroTipo);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      registrosFiltrados = registrosFiltrados.filter(r => 
        r.titulo.toLowerCase().includes(terminoBusqueda) ||
        r.subtitulo.toLowerCase().includes(terminoBusqueda) ||
        r.descripcion.toLowerCase().includes(terminoBusqueda)
      );
    }

    setRegistrosFiltrados(registrosFiltrados);
  };

  const confirmarEliminar = (registro: RegistroUnificado) => {
    setRegistroAEliminar(registro);
    setMostrarConfirmacion(true);
  };

  const eliminarRegistro = async () => {
    if (!registroAEliminar) return;

    setEliminando(registroAEliminar.id);
    try {
      const coleccion = registroAEliminar.tipo;
      await deleteDoc(doc(db, coleccion, registroAEliminar.id));
      
      // Actualizar estado local
      setRegistros(prev => prev.filter(r => r.id !== registroAEliminar.id));
      
      mostrarNotificacion(
        `${registroAEliminar.tipo.slice(0, -1).charAt(0).toUpperCase() + registroAEliminar.tipo.slice(1, -1)} eliminado exitosamente`, 
        'success'
      );
    } catch (error) {
      console.error('Error eliminando registro:', error);
      mostrarNotificacion('Error al eliminar el registro', 'error');
    } finally {
      setEliminando(null);
      setMostrarConfirmacion(false);
      setRegistroAEliminar(null);
    }
  };

  const obtenerIconoTipo = (tipo: TipoRegistro) => {
    switch (tipo) {
      case 'solicitudes':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        );
      case 'clientes':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        );
      case 'productos':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const obtenerColorTipo = (tipo: TipoRegistro) => {
    switch (tipo) {
      case 'solicitudes':
        return '#3b82f6';
      case 'clientes':
        return '#10b981';
      case 'productos':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const obtenerEstadoColor = (estado?: string) => {
    if (!estado) return '#6b7280';
    switch (estado) {
      case 'pendiente':
        return '#f59e0b';
      case 'emitida':
        return '#10b981';
      case 'cancelada':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (!mostrar) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-eliminar" ref={modalPrincipalRef}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <div>
              <h3>Administrador de Eliminación</h3>
              <p>Eliminar registros permanentemente de la base de datos</p>
            </div>
          </div>
          <button onClick={onCerrar} className="btn-cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Controles */}
        <div className="controles-section">
          <div className="controles-filtros">
            <div className="filtro-grupo">
              <label>Tipo de registro:</label>
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="select-filtro"
              >
                <option value="todos">Todos los tipos</option>
                <option value="solicitudes">Solicitudes</option>
                <option value="clientes">Clientes</option>
                <option value="productos">Productos</option>
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label>Buscar:</label>
              <div className="input-busqueda">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar registros..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="controles-stats">
            <div className="stat-item">
              <span className="stat-number">{registrosFiltrados.length}</span>
              <span className="stat-label">Registros mostrados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{registros.length}</span>
              <span className="stat-label">Total registros</span>
            </div>
          </div>
        </div>

        {/* Lista de registros */}
        <div className="registros-container">
          {cargando ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando registros...</p>
            </div>
          ) : registrosFiltrados.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <p>No se encontraron registros</p>
              <span>Prueba ajustando los filtros de búsqueda</span>
            </div>
          ) : (
            <div className="registros-lista">
              {registrosFiltrados.map((registro) => (
                <div key={`${registro.tipo}-${registro.id}`} className="registro-item">
                  <div className="registro-icon" style={{ color: obtenerColorTipo(registro.tipo) }}>
                    {obtenerIconoTipo(registro.tipo)}
                  </div>
                  
                  <div className="registro-info">
                    <div className="registro-header">
                      <h4>{registro.titulo}</h4>
                      <div className="registro-badges">
                        <span 
                          className="tipo-badge"
                          style={{ backgroundColor: `${obtenerColorTipo(registro.tipo)}15`, color: obtenerColorTipo(registro.tipo) }}
                        >
                          {registro.tipo}
                        </span>
                        {registro.estado && (
                          <span 
                            className="estado-badge"
                            style={{ backgroundColor: `${obtenerEstadoColor(registro.estado)}15`, color: obtenerEstadoColor(registro.estado) }}
                          >
                            {registro.estado}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="registro-detalles">
                      <p className="registro-subtitulo">{registro.subtitulo}</p>
                      <p className="registro-descripcion">{registro.descripcion}</p>
                      <p className="registro-fecha">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        {formatearFechaHora(registro.fecha)}
                      </p>
                    </div>
                  </div>

                  <div className="registro-acciones">
                    <button
                      onClick={() => confirmarEliminar(registro)}
                      disabled={eliminando === registro.id}
                      className="btn-eliminar-registro"
                    >
                      {eliminando === registro.id ? (
                        <>
                          <div className="spinner-small"></div>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                          </svg>
                          Eliminar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✨ Modal de confirmación CON CENTRADO AUTOMÁTICO */}
        {mostrarConfirmacion && registroAEliminar && (
          <div className="modal-overlay-confirmacion">
            <div className="modal-confirmacion" ref={modalConfirmacionRef}>
              <div className="confirmacion-header">
                <div className="confirmacion-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>Confirmar Eliminación</h3>
              </div>
              
              <div className="confirmacion-content">
                <p><strong>¿Estás seguro de que quieres eliminar este registro?</strong></p>
                <div className="registro-preview">
                  <div className="preview-icon" style={{ color: obtenerColorTipo(registroAEliminar.tipo) }}>
                    {obtenerIconoTipo(registroAEliminar.tipo)}
                  </div>
                  <div>
                    <p className="preview-titulo">{registroAEliminar.titulo}</p>
                    <p className="preview-subtitulo">{registroAEliminar.subtitulo}</p>
                    <p className="preview-tipo">Tipo: {registroAEliminar.tipo}</p>
                  </div>
                </div>
                <div className="advertencia">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Esta acción no se puede deshacer. El registro será eliminado permanentemente de la base de datos.</span>
                </div>
              </div>

              <div className="confirmacion-acciones">
                <button
                  onClick={() => {
                    setMostrarConfirmacion(false);
                    setRegistroAEliminar(null);
                  }}
                  className="btn-cancelar-confirmacion"
                  disabled={eliminando !== null}
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarRegistro}
                  className="btn-confirmar-eliminacion"
                  disabled={eliminando !== null}
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar Permanentemente'}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .modal-eliminar {
            max-width: 900px !important;
            width: 95vw !important;
            max-height: 90vh !important;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #fef2f2, #fef7f7);
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .header-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .modal-header p {
            margin: 0.25rem 0 0 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .btn-cerrar {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .btn-cerrar:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .controles-section {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .controles-filtros {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .filtro-grupo {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .filtro-grupo label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
          }

          .select-filtro {
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            cursor: pointer;
            min-width: 160px;
          }

          .select-filtro:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .input-busqueda {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-busqueda svg {
            position: absolute;
            left: 0.75rem;
            color: #9ca3af;
            z-index: 1;
          }

          .input-busqueda input {
            padding: 0.5rem 0.75rem 0.5rem 2.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            min-width: 200px;
          }

          .input-busqueda input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .controles-stats {
            display: flex;
            gap: 2rem;
          }

          .stat-item {
            text-align: center;
          }

          .stat-number {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }

          .stat-label {
            font-size: 0.75rem;
            color: #6b7280;
            font-weight: 500;
          }

          .registros-container {
            flex: 1;
            overflow-y: auto;
            max-height: 60vh;
          }

          .loading-state,
          .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: #6b7280;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          .empty-state p {
            margin: 1rem 0 0.5rem 0;
            color: #374151;
            font-size: 1.125rem;
          }

          .registros-lista {
            padding: 1rem;
          }

          .registro-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 0.75rem;
            background: white;
            transition: all 0.2s;
          }

          .registro-item:hover {
            border-color: #ef4444;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
          }

          .registro-icon {
            width: 48px;
            height: 48px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .registro-info {
            flex: 1;
            min-width: 0;
          }

          .registro-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
          }

          .registro-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1rem;
            font-weight: 600;
          }

          .registro-badges {
            display: flex;
            gap: 0.5rem;
          }

          .tipo-badge,
          .estado-badge {
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .registro-detalles {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .registro-subtitulo {
            margin: 0;
            color: #4b5563;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .registro-descripcion {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .registro-fecha {
            margin: 0;
            color: #9ca3af;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .registro-acciones {
            flex-shrink: 0;
          }

          .btn-eliminar-registro {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.2s;
          }

          .btn-eliminar-registro:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }

          .btn-eliminar-registro:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .spinner-small {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .modal-overlay-confirmacion {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
          }

          .modal-confirmacion {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 500px;
            width: 100%;
          }

          .confirmacion-header {
            text-align: center;
            padding: 2rem 1.5rem 1rem;
          }

          .confirmacion-icon {
            margin: 0 auto 1rem;
          }

          .confirmacion-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .confirmacion-content {
            padding: 0 1.5rem 1.5rem;
          }

          .confirmacion-content > p {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #374151;
          }

          .registro-preview {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 12px;
            margin-bottom: 1rem;
          }

          .preview-icon {
            width: 40px;
            height: 40px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .preview-titulo {
            margin: 0;
            font-weight: 600;
            color: #1f2937;
          }

          .preview-subtitulo {
            margin: 0.25rem 0 0 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .preview-tipo {
            margin: 0.25rem 0 0 0;
            color: #9ca3af;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 500;
          }

          .advertencia {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            color: #92400e;
            font-size: 0.875rem;
          }

          .confirmacion-acciones {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          .btn-cancelar-confirmacion,
          .btn-confirmar-eliminacion {
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-cancelar-confirmacion {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .btn-cancelar-confirmacion:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
          }

          .btn-confirmar-eliminacion {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
          }

          .btn-confirmar-eliminacion:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }

          .btn-cancelar-confirmacion:disabled,
          .btn-confirmar-eliminacion:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .modal-eliminar {
              width: 98vw !important;
              max-height: 95vh !important;
            }

            .controles-filtros {
              flex-direction: column;
              gap: 1rem;
            }

            .input-busqueda input {
              min-width: 100%;
            }

            .registro-item {
              flex-direction: column;
              align-items: stretch;
              text-align: center;
            }

            .registro-header {
              flex-direction: column;
              gap: 0.5rem;
              align-items: center;
            }

            .confirmacion-acciones {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDelete;