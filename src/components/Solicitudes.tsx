// src/components/Solicitudes.tsx - CON MEJORAS VISUALES + EDICIÓN
import React, { useState, useEffect } from 'react';
import { actualizarSolicitud } from '../services/database';
import { 
  obtenerSolicitudes,
  emitirFactura,
  cancelarSolicitud,
  obtenerClientes,
  obtenerProductos,
  crearSolicitud
} from '../services/database';
import FormularioSolicitud from './FormularioSolicitud';
import { Solicitud, Cliente, Producto } from '../types/interfaces';
import { formatearMontoConSimbolo, formatearFechaHora, validarRUC, formatearMonto } from '../utils';

interface SolicitudesProps {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

// Modal de confirmación
interface ModalConfirmacionProps {
  mostrar: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
  cargando?: boolean;
  mostrarCampoComentario?: boolean;
  comentario?: string;
  onComentarioChange?: (comentario: string) => void;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  mostrar,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  cargando = false,
  mostrarCampoComentario = false,
  comentario = '',
  onComentarioChange
}) => {
  if (!mostrar) return null;

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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>{titulo}</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>{mensaje}</p>
        
        {mostrarCampoComentario && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Comentario (opcional):
            </label>
            <textarea
              value={comentario}
              onChange={(e) => onComentarioChange?.(e.target.value)}
              placeholder="Motivo de la cancelación..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '80px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1
            }}
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '6px',
              background: '#dc2626',
              color: 'white',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1
            }}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de edición de solicitud
interface ModalEdicionProps {
  mostrar: boolean;
  solicitud: Solicitud | null;
  onGuardar: (solicitudEditada: any) => void;
  onCancelar: () => void;
  cargando: boolean;
  clientes: Cliente[];
  productos: Producto[];
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

const ModalEdicion: React.FC<ModalEdicionProps> = ({
  mostrar,
  solicitud,
  onGuardar,
  onCancelar,
  cargando,
  clientes,
  productos,
  mostrarNotificacion
}) => {
  const [datosEdicion, setDatosEdicion] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    productoId: '',
    monto: ''
  });
  const [errores, setErrores] = useState<any>({});

  useEffect(() => {
    if (solicitud) {
      setDatosEdicion({
        ruc: solicitud.cliente.ruc,
        razonSocial: solicitud.cliente.razonSocial,
        email: solicitud.cliente.email,
        productoId: solicitud.productoId,
        monto: solicitud.monto.toString()
      });
    }
  }, [solicitud]);

  const validarFormulario = () => {
    const nuevosErrores: any = {};

    if (!datosEdicion.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es obligatorio';
    } else if (!validarRUC(datosEdicion.ruc)) {
      nuevosErrores.ruc = 'El formato del RUC no es válido';
    }

    if (!datosEdicion.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria';
    }

    if (!datosEdicion.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    }

    if (!datosEdicion.productoId) {
      nuevosErrores.productoId = 'Debe seleccionar un producto';
    }

    if (!datosEdicion.monto || parseInt(datosEdicion.monto) <= 0) {
      nuevosErrores.monto = 'El monto debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = () => {
    if (!validarFormulario()) {
      mostrarNotificacion('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    const producto = productos.find(p => p.id === datosEdicion.productoId);
    if (!producto) return;

    onGuardar({
      ...solicitud,
      cliente: {
        ruc: datosEdicion.ruc.trim(),
        razonSocial: datosEdicion.razonSocial.trim(),
        email: datosEdicion.email.trim()
      },
      producto: {
        nombre: producto.nombre
      },
      productoId: datosEdicion.productoId,
      monto: parseInt(datosEdicion.monto)
    });
  };

  if (!mostrar || !solicitud) return null;

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
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Editar Solicitud</h3>
          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* RUC */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              RUC
            </label>
            <input
              type="text"
              value={datosEdicion.ruc}
              onChange={(e) => setDatosEdicion(prev => ({ ...prev, ruc: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errores.ruc ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            />
            {errores.ruc && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errores.ruc}</span>}
          </div>

          {/* Razón Social */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Razón Social
            </label>
            <input
              type="text"
              value={datosEdicion.razonSocial}
              onChange={(e) => setDatosEdicion(prev => ({ ...prev, razonSocial: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errores.razonSocial ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            />
            {errores.razonSocial && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errores.razonSocial}</span>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={datosEdicion.email}
              onChange={(e) => setDatosEdicion(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errores.email ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            />
            {errores.email && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errores.email}</span>}
          </div>

          {/* Producto */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Producto
            </label>
            <select
              value={datosEdicion.productoId}
              onChange={(e) => setDatosEdicion(prev => ({ ...prev, productoId: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errores.productoId ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            >
              <option value="">Seleccionar producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            {errores.productoId && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errores.productoId}</span>}
          </div>

          {/* Monto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Monto (Guaraníes)
            </label>
            <input
              type="text"
              value={datosEdicion.monto ? formatearMonto(datosEdicion.monto) : ''}
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/[^\d]/g, '');
                setDatosEdicion(prev => ({ ...prev, monto: soloNumeros }));
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errores.monto ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              disabled={cargando}
            />
            {errores.monto && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errores.monto}</span>}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancelar}
              disabled={cargando}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button
              onClick={manejarGuardar}
              disabled={cargando}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.6 : 1
              }}
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Solicitudes: React.FC<SolicitudesProps> = ({ mostrarNotificacion }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  
  // Estados para modales
  const [mostrarModalEmitir, setMostrarModalEmitir] = useState<boolean>(false);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState<boolean>(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState<boolean>(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [comentarioCancelacion, setComentarioCancelacion] = useState<string>('');

  // Estados para edición
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'emitida' | 'cancelada'>('todos');

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [datosSolicitudes, datosClientes, datosProductos] = await Promise.all([
        obtenerSolicitudes(),
        obtenerClientes(),
        obtenerProductos()
      ]);
      
      setSolicitudes(datosSolicitudes);
      setClientes(datosClientes);
      setProductos(datosProductos);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
      mostrarNotificacion('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    if (filtroEstado === 'todos') return true;
    return solicitud.estado === filtroEstado;
  });

  // Manejar emisión de factura
  const manejarEmitirFactura = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModalEmitir(true);
  };

  const confirmarEmitirFactura = async () => {
    if (!solicitudSeleccionada?.id) return;

    setProcesandoId(solicitudSeleccionada.id);
    try {
      await emitirFactura(solicitudSeleccionada.id);
      
      // Actualizar estado local
      setSolicitudes(prev => prev.map(s => 
        s.id === solicitudSeleccionada.id 
          ? { ...s, estado: 'emitida' as const, fechaEmision: new Date() }
          : s
      ));
      
      mostrarNotificacion('Factura emitida exitosamente', 'success');
    } catch (error) {
      console.error('Error emitiendo factura:', error);
      mostrarNotificacion('Error al emitir la factura', 'error');
    } finally {
      setProcesandoId(null);
      setMostrarModalEmitir(false);
      setSolicitudSeleccionada(null);
    }
  };

  // Manejar cancelación
  const manejarCancelarSolicitud = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setComentarioCancelacion('');
    setMostrarModalCancelar(true);
  };

  const confirmarCancelarSolicitud = async () => {
    if (!solicitudSeleccionada?.id) return;

    setProcesandoId(solicitudSeleccionada.id);
    try {
      await cancelarSolicitud(solicitudSeleccionada.id, comentarioCancelacion.trim());
      
      // Actualizar estado local
      setSolicitudes(prev => prev.map(s => 
        s.id === solicitudSeleccionada.id 
          ? { 
              ...s, 
              estado: 'cancelada' as const, 
              fechaCancelacion: new Date(),
              comentarioCancelacion: comentarioCancelacion.trim() 
            }
          : s
      ));
      
      mostrarNotificacion('Solicitud cancelada exitosamente', 'success');
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      mostrarNotificacion('Error al cancelar la solicitud', 'error');
    } finally {
      setProcesandoId(null);
      setMostrarModalCancelar(false);
      setSolicitudSeleccionada(null);
      setComentarioCancelacion('');
    }
  };

  // Manejar edición
  const manejarEditarSolicitud = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModalEdicion(true);
  };

  const guardarEdicionSolicitud = async (solicitudEditada: any) => {
    if (!solicitudEditada.id) return;

    setProcesandoId(solicitudEditada.id);
    try {
      await actualizarSolicitud(solicitudEditada.id, solicitudEditada);
      setSolicitudes(prev => prev.map(s => 
        s.id === solicitudEditada.id ? solicitudEditada : s
      ));
      
      mostrarNotificacion('Solicitud actualizada exitosamente', 'success');
      setMostrarModalEdicion(false);
      setSolicitudSeleccionada(null);
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      mostrarNotificacion('Error al actualizar la solicitud', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  // Obtener clase de estado
  const obtenerClaseEstado = (estado: string): string => {
    switch (estado) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'emitida':
        return 'estado-emitida';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return 'estado-pendiente';
    }
  };

  // Obtener icono de estado
  const obtenerIconoEstado = (estado: string): React.ReactElement => {
    switch (estado) {
      case 'pendiente':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      case 'emitida':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        );
      case 'cancelada':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  if (cargando) {
    return (
      <div className="solicitudes-container">
        <div className="solicitudes-header">
          <h2>Solicitudes</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitudes-container">
        <div className="solicitudes-header">
          <h2>Solicitudes</h2>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-container">
      {/* Header */}
      <div className="solicitudes-header">
        <div>
          <h2>Gestión de Solicitudes</h2>
          <p className="solicitudes-subtitle">Administra las solicitudes de facturación</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={cargarDatos}
            className="btn-refrescar"
            disabled={cargando}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4-4.64,4.36A9,9,0,0,1,3.51,15"/>
            </svg>
            Actualizar
          </button>
          <button 
            onClick={() => setMostrarFormulario(true)}
            className="btn-nueva-solicitud"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-grupo">
          <label htmlFor="filtroEstado">Filtrar por estado:</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="filtro-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="emitida">Emitidas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        
        <div className="resumen-filtros">
          <span className="resumen-texto">
            Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
          </span>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="solicitudes-lista">
        {solicitudesFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <p>No hay solicitudes para mostrar</p>
            <span>
              {filtroEstado === 'todos' 
                ? 'Crea tu primera solicitud usando el botón "Nueva Solicitud"'
                : `No hay solicitudes con estado "${filtroEstado}"`
              }
            </span>
          </div>
        ) : (
          <div className="solicitudes-grid">
            {solicitudesFiltradas.map((solicitud) => (
              <div key={solicitud.id} className="solicitud-card">
                {/* Header de la card */}
                <div className="solicitud-header">
                  <div className="solicitud-info">
                    <h4>Solicitud #{solicitud.id?.slice(-8).toUpperCase()}</h4>
                    <div className={`estado-badge ${obtenerClaseEstado(solicitud.estado)}`}>
                      {obtenerIconoEstado(solicitud.estado)}
                      <span>{solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}</span>
                    </div>
                  </div>
                  <div className="solicitud-monto">
                    {formatearMontoConSimbolo(solicitud.monto)}
                  </div>
                </div>

                {/* Detalles del cliente */}
                <div className="solicitud-cliente">
                  <div className="cliente-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cliente-nombre">{solicitud.cliente.razonSocial}</div>
                    <div className="cliente-ruc">RUC: {solicitud.cliente.ruc}</div>
                  </div>
                </div>

                {/* Detalles del producto */}
                <div className="solicitud-producto">
                  <div className="producto-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <span>{solicitud.producto.nombre}</span>
                </div>

                {/* Fechas */}
                <div className="solicitud-fechas">
                  <div className="fecha-item">
                    <span className="fecha-label">Solicitado:</span>
                    <span className="fecha-valor">
                      {formatearFechaHora(solicitud.fechaSolicitud)}
                    </span>
                  </div>
                  {solicitud.fechaEmision && (
                    <div className="fecha-item">
                      <span className="fecha-label">Emitido:</span>
                      <span className="fecha-valor">
                        {formatearFechaHora(solicitud.fechaEmision)}
                      </span>
                    </div>
                  )}
                  {solicitud.fechaCancelacion && (
                    <div className="fecha-item">
                      <span className="fecha-label">Cancelado:</span>
                      <span className="fecha-valor">
                        {formatearFechaHora(solicitud.fechaCancelacion)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comentario de cancelación */}
                {solicitud.estado === 'cancelada' && solicitud.comentarioCancelacion && (
                  <div className="comentario-cancelacion">
                    <span className="comentario-label">Motivo:</span>
                    <span className="comentario-texto">{solicitud.comentarioCancelacion}</span>
                  </div>
                )}

                {/* Acciones */}
                {solicitud.estado === 'pendiente' && (
                  <div className="solicitud-acciones">
                    <button
                      onClick={() => manejarEditarSolicitud(solicitud)}
                      disabled={procesandoId === solicitud.id}
                      className="btn-editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => manejarEmitirFactura(solicitud)}
                      disabled={procesandoId === solicitud.id}
                      className="btn-emitir"
                    >
                      {procesandoId === solicitud.id ? (
                        <>
                          <div className="spinner-small"></div>
                          Emitiendo...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                          Emitir Factura
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => manejarCancelarSolicitud(solicitud)}
                      disabled={procesandoId === solicitud.id}
                      className="btn-cancelar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario de nueva solicitud */}
      <FormularioSolicitud
        mostrar={mostrarFormulario}
        onCerrar={() => setMostrarFormulario(false)}
        mostrarNotificacion={mostrarNotificacion}
        onSolicitudCreada={() => {
          cargarDatos();
          //mostrarNotificacion('Solicitud creada exitosamente', 'success');
        }}
      />

      {/* Modal de confirmación para emitir */}
      <ModalConfirmacion
        mostrar={mostrarModalEmitir}
        titulo="Emitir Factura"
        mensaje={`¿Confirmas que quieres emitir la factura para "${solicitudSeleccionada?.cliente.razonSocial}" por ${formatearMontoConSimbolo(solicitudSeleccionada?.monto || 0)}?`}
        onConfirmar={confirmarEmitirFactura}
        onCancelar={() => {
          setMostrarModalEmitir(false);
          setSolicitudSeleccionada(null);
        }}
        textoConfirmar="Emitir Factura"
        textoCancelar="Cancelar"
        cargando={procesandoId === solicitudSeleccionada?.id}
      />

      {/* Modal de confirmación para cancelar */}
      <ModalConfirmacion
        mostrar={mostrarModalCancelar}
        titulo="Cancelar Solicitud"
        mensaje={`¿Estás seguro de que quieres cancelar esta solicitud?`}
        onConfirmar={confirmarCancelarSolicitud}
        onCancelar={() => {
          setMostrarModalCancelar(false);
          setSolicitudSeleccionada(null);
          setComentarioCancelacion('');
        }}
        textoConfirmar="Cancelar Solicitud"
        textoCancelar="No Cancelar"
        cargando={procesandoId === solicitudSeleccionada?.id}
        mostrarCampoComentario={true}
        comentario={comentarioCancelacion}
        onComentarioChange={setComentarioCancelacion}
      />

      {/* Modal de edición */}
      <ModalEdicion
        mostrar={mostrarModalEdicion}
        solicitud={solicitudSeleccionada}
        onGuardar={guardarEdicionSolicitud}
        onCancelar={() => {
          setMostrarModalEdicion(false);
          setSolicitudSeleccionada(null);
        }}
        cargando={procesandoId === solicitudSeleccionada?.id}
        clientes={clientes}
        productos={productos}
        mostrarNotificacion={mostrarNotificacion}
      />

      <style>{`
        .solicitudes-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .solicitudes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .solicitudes-header h2 {
          color: #1f2937;
          margin: 0;
          font-size: 1.875rem;
          font-weight: 700;
        }

        .solicitudes-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0 0;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-refrescar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .btn-refrescar:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-refrescar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-nueva-solicitud {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }

        .btn-nueva-solicitud:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
        }

        .filtros-container {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border: 1px solid #e5e7eb;
        }

        .filtros-grupo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filtros-grupo label {
          font-weight: 500;
          color: #374151;
        }

        .filtro-select {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filtro-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .resumen-filtros {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .solicitudes-lista {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-icon {
          margin: 0 auto 1rem;
        }

        .empty-state p {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .solicitudes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .solicitud-card {
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.2s;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .solicitud-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981);
        }

        .solicitud-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .solicitud-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .solicitud-info h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .estado-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .estado-pendiente {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .estado-emitida {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }

        .estado-cancelada {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .solicitud-monto {
          font-size: 1.25rem;
          font-weight: 700;
          color: #059669;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #a7f3d0;
        }

        .solicitud-cliente,
        .solicitud-producto {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .cliente-icon,
        .producto-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .cliente-nombre {
          font-weight: 600;
          color: #1f2937;
        }

        .cliente-ruc {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .solicitud-fechas {
          margin-bottom: 1rem;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .fecha-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .fecha-item:last-child {
          margin-bottom: 0;
        }

        .fecha-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .fecha-valor {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .comentario-cancelacion {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .comentario-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #991b1b;
          display: block;
          margin-bottom: 0.25rem;
        }

        .comentario-texto {
          font-size: 0.875rem;
          color: #7f1d1d;
        }

        .solicitud-acciones {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }

        .btn-editar,
        .btn-emitir,
        .btn-cancelar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.2s;
          text-align: center;
        }

        .btn-editar {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .btn-editar:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-emitir {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-emitir:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-cancelar {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn-cancelar:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-editar:disabled,
        .btn-emitir:disabled,
        .btn-cancelar:disabled {
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

        .loading-state,
        .error-state {
          text-align: center;
          padding: 2rem;
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
          .modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .solicitudes-container {
            padding: 1rem;
          }

          .solicitudes-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }

          .filtros-container {
            flex-direction: column;
            align-items: stretch;
          }

          .solicitudes-grid {
            grid-template-columns: 1fr;
          }

          .solicitud-acciones {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .solicitud-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .solicitud-monto {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Solicitudes;