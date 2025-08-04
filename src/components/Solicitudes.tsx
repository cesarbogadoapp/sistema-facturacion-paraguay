// src/components/Solicitudes.tsx - VERSIÓN MEJORADA COMPLETA
import React, { useState, useEffect, useRef } from 'react';
import { actualizarSolicitud } from '../services/database';
import { 
  obtenerSolicitudes,
  emitirFactura,
  cancelarSolicitud,
  obtenerClientes,
  obtenerProductos,
  crearSolicitud
} from '../services/database';
import FormularioSolicitudMejorado from './FormularioSolicitudMejorado';
import ModalEdicionCompleto from './ModalEdicionCompleto';
import { Solicitud, Cliente, Producto } from '../types/interfaces';
import { formatearMontoConSimbolo, formatearFechaHora, validarRUC, formatearMonto } from '../utils';

interface SolicitudesProps {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

// Modal de confirmación - CON CENTRADO AUTOMÁTICO
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
  // ✨ REF PARA CENTRADO AUTOMÁTICO
  const modalRef = useRef<HTMLDivElement>(null);

  // ✨ EFECTO PARA CENTRADO AUTOMÁTICO
  useEffect(() => {
    if (mostrar) {
      setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 0);
    }
  }, [mostrar]);

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
      <div 
        ref={modalRef}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
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
  const [filtroFecha, setFiltroFecha] = useState<'todas' | 'hoy' | 'ayer' | 'esta_semana' | 'este_mes' | 'mes_pasado'>('todas');
  const [descargandoCSV, setDescargandoCSV] = useState<boolean>(false);

  const descargarCSV = async () => {
  setDescargandoCSV(true);
  try {
    // Crear CSV content
    let csvContent = 'ID,Cliente,RUC,Email,Producto,Monto,Estado,Fecha Solicitud,Fecha Emision\n';
    
    solicitudesFiltradas.forEach(solicitud => {
      csvContent += `"${solicitud.id || ''}",`;
      csvContent += `"${solicitud.cliente.razonSocial}",`;
      csvContent += `"${solicitud.cliente.ruc}",`;
      csvContent += `"${solicitud.cliente.email}",`;
      csvContent += `"${solicitud.producto.nombre}",`;
      csvContent += `"${formatearMontoConSimbolo(solicitud.monto)}",`;
      csvContent += `"${solicitud.estado}",`;
      csvContent += `"${formatearFechaHora(solicitud.fechaSolicitud)}",`;
      csvContent += `"${solicitud.fechaEmision ? formatearFechaHora(solicitud.fechaEmision) : 'N/A'}"\n`;
    });

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `solicitudes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    mostrarNotificacion('Archivo CSV descargado exitosamente', 'success');
  } catch (error) {
    console.error('Error descargando CSV:', error);
    mostrarNotificacion('Error al descargar el archivo CSV', 'error');
  } finally {
    setDescargandoCSV(false);
  }
};

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
  // Filtrar por estado
  if (filtroEstado !== 'todos' && solicitud.estado !== filtroEstado) {
    return false;
  }

  // Filtrar por fecha
  if (filtroFecha !== 'todas') {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const fechaSolicitud = solicitud.fechaSolicitud?.toDate ? 
      solicitud.fechaSolicitud.toDate() : 
      new Date(solicitud.fechaSolicitud);
    
    switch (filtroFecha) {
      case 'hoy':
        const inicioHoy = new Date(hoy);
        const finHoy = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
        return fechaSolicitud >= inicioHoy && fechaSolicitud < finHoy;
        
      case 'ayer':
        const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);
        const finAyer = new Date(hoy);
        return fechaSolicitud >= ayer && fechaSolicitud < finAyer;
        
      case 'esta_semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        return fechaSolicitud >= inicioSemana;
        
      case 'este_mes':
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return fechaSolicitud >= inicioMes;
        
      case 'mes_pasado':
        const inicioMesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const finMesPasado = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return fechaSolicitud >= inicioMesPasado && fechaSolicitud < finMesPasado;
        
      default:
        return true;
    }
  }

  return true;
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
          <button onClick={descargarCSV} disabled={descargandoCSV} className="btn-descargar-csv">
            {descargandoCSV ? (
              <>
                <div className="spinner-small"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Descargar CSV</span>
              </>
            )}
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

        <div className="filtros-grupo">
          <label htmlFor="filtroFecha">Filtrar por fecha:</label>
          <select
            id="filtroFecha"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value as any)}
            className="filtro-select"
          >
            <option value="todas">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="esta_semana">Esta semana</option>
            <option value="este_mes">Este mes</option>
            <option value="mes_pasado">Mes pasado</option>
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
            {solicitudesFiltradas.map((solicitud, index) => (
              <div key={solicitud.id} className={`solicitud-card-nueva estado-${solicitud.estado}`}>
                
                {/* HEADER CON NÚMERO DE SOLICITUD Y ESTADO */}
                <div className="solicitud-header-nueva">
                  <div className="numero-solicitud-nueva">
                    <span className="numero-icono">#{(index + 1).toString().padStart(3, '0')}</span>
                    <span className="numero-texto">ID: {solicitud.id?.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="header-derecha">
                    <div className={`estado-badge-nueva ${obtenerClaseEstado(solicitud.estado)}`}>
                      {obtenerIconoEstado(solicitud.estado)}
                      <span>{solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}</span>
                    </div>
                    <div className="monto-principal">
                      {formatearMontoConSimbolo(solicitud.monto)}
                    </div>
                  </div>
                </div>

                {/* BLOQUE 1: DATOS DEL CLIENTE */}
                <div className="bloque-seccion cliente-seccion">
                  <div className="seccion-header">
                    <div className="seccion-icono cliente-icono">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span className="seccion-titulo">Información del Cliente</span>
                  </div>
                  <div className="seccion-contenido">
                    <div className="dato-fila">
                      <span className="dato-label">Empresa:</span>
                      <span className="dato-valor empresa-nombre">{solicitud.cliente.razonSocial}</span>
                    </div>
                    <div className="dato-fila">
                      <span className="dato-label">RUC:</span>
                      <span className="dato-valor">{solicitud.cliente.ruc}</span>
                    </div>
                    <div className="dato-fila">
                      <span className="dato-label">Email:</span>
                      <span className="dato-valor">{solicitud.cliente.email}</span>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 2: NÚMERO DE GUÍA (solo si existe) */}
                {solicitud.numeroGuia && (
                  <div className="bloque-seccion guia-seccion">
                    <div className="seccion-header">
                      <div className="seccion-icono guia-icono">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13"/>
                          <path d="M16 8l2 0 0 8-8 0"/>
                          <path d="M21 11.5l-5 5"/>
                        </svg>
                      </div>
                      <span className="seccion-titulo">Guía Logística</span>
                    </div>
                    <div className="seccion-contenido">
                      <div className="dato-fila">
                        <span className="dato-label">Número de Guía:</span>
                        <span className="dato-valor guia-numero">{solicitud.numeroGuia}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* BLOQUE 3: PRODUCTOS */}
                <div className="bloque-seccion productos-seccion">
                  <div className="seccion-header">
                    <div className="seccion-icono productos-icono">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <span className="seccion-titulo">
                      Productos {solicitud.productos && solicitud.productos.length > 0 ? `(${solicitud.productos.length})` : '(1)'}
                    </span>
                  </div>
                  <div className="seccion-contenido">
                    
                    {/* MOSTRAR MÚLTIPLES PRODUCTOS SI EXISTEN */}
                    {solicitud.productos && solicitud.productos.length > 0 ? (
                      solicitud.productos.map((producto, prodIndex) => (
                        <div key={prodIndex} className="producto-item-nueva">
                          <div className="producto-numero-badge">#{prodIndex + 1}</div>
                          <div className="producto-detalles">
                            <div className="producto-nombre">{producto.nombre}</div>
                            <div className="producto-info-grid">
                              <div className="producto-info-item">
                                <span className="info-label">Cantidad:</span>
                                <span className="info-valor">{producto.cantidad}</span>
                              </div>
                              <div className="producto-info-item">
                                <span className="info-label">Precio Unit.:</span>
                                <span className="info-valor">{formatearMontoConSimbolo(producto.precioUnitario)}</span>
                              </div>
                              <div className="producto-info-item subtotal-item">
                                <span className="info-label">Subtotal:</span>
                                <span className="info-valor subtotal-valor">{formatearMontoConSimbolo(producto.subtotal)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* PRODUCTO LEGACY (formato anterior) */
                      <div className="producto-item-nueva">
                        <div className="producto-numero-badge">#1</div>
                        <div className="producto-detalles">
                          <div className="producto-nombre">{solicitud.producto.nombre}</div>
                          <div className="producto-info-grid">
                            <div className="producto-info-item">
                              <span className="info-label">Cantidad:</span>
                              <span className="info-valor">1</span>
                            </div>
                            <div className="producto-info-item">
                              <span className="info-label">Precio Unit.:</span>
                              <span className="info-valor">{formatearMontoConSimbolo(solicitud.monto)}</span>
                            </div>
                            <div className="producto-info-item subtotal-item">
                              <span className="info-label">Subtotal:</span>
                              <span className="info-valor subtotal-valor">{formatearMontoConSimbolo(solicitud.monto)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* TOTAL GENERAL */}
                    <div className="total-productos">
                      <span className="total-label">Total General:</span>
                      <span className="total-valor">{formatearMontoConSimbolo(solicitud.monto)}</span>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 4: FECHAS Y METADATOS */}
                <div className="bloque-seccion fechas-seccion">
                  <div className="seccion-header">
                    <div className="seccion-icono fechas-icono">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                    <span className="seccion-titulo">Fechas</span>
                  </div>
                  <div className="seccion-contenido">
                    <div className="dato-fila">
                      <span className="dato-label">Solicitud:</span>
                      <span className="dato-valor">{formatearFechaHora(solicitud.fechaSolicitud)}</span>
                    </div>
                    {solicitud.fechaEmision && (
                      <div className="dato-fila emitida">
                        <span className="dato-label">Emitida:</span>
                        <span className="dato-valor">{formatearFechaHora(solicitud.fechaEmision)}</span>
                      </div>
                    )}
                    {solicitud.fechaCancelacion && (
                      <div className="dato-fila cancelada">
                        <span className="dato-label">Cancelada:</span>
                        <span className="dato-valor">{formatearFechaHora(solicitud.fechaCancelacion)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BLOQUE 5: BOTONES DE ACCIÓN */}
                <div className="bloque-acciones">
                  {solicitud.estado === 'pendiente' ? (
                    <div className="acciones-pendiente">
                      <button
                        onClick={() => manejarEditarSolicitud(solicitud)}
                        disabled={procesandoId === solicitud.id}
                        className="btn-accion btn-editar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      
                      <button
                        onClick={() => manejarEmitirFactura(solicitud)}
                        disabled={procesandoId === solicitud.id}
                        className="btn-accion btn-emitir"
                      >
                        {procesandoId === solicitud.id ? (
                          <>
                            <div className="spinner-btn"></div>
                            Emitiendo...
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            Emitir
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => manejarCancelarSolicitud(solicitud)}
                        disabled={procesandoId === solicitud.id}
                        className="btn-accion btn-cancelar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="acciones-completada">
                      <div className="estado-final">
                        {obtenerIconoEstado(solicitud.estado)}
                        <span>Solicitud {solicitud.estado}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMENTARIO DE CANCELACIÓN (si existe) */}
                {solicitud.estado === 'cancelada' && solicitud.comentarioCancelacion && (
                  <div className="comentario-cancelacion-nueva">
                    <div className="comentario-header-nueva">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>Motivo de cancelación:</span>
                    </div>
                    <p className="comentario-texto-nueva">{solicitud.comentarioCancelacion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORMULARIO MEJORADO */}
      <FormularioSolicitudMejorado
        mostrar={mostrarFormulario}
        onCerrar={() => setMostrarFormulario(false)}
        mostrarNotificacion={mostrarNotificacion}
        onSolicitudCreada={() => {
          cargarDatos();
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

      {/* Modal de edición COMPLETO */}
      <ModalEdicionCompleto
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

      {/* CSS COMPLETO MEJORADO */}
      <style>{`
      /* ===== ESTILOS COMPACTOS PARA SOLICITUDES - REDUCIDOS AL 30% ===== */

      .solicitudes-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
        background: #f8fafc;
        min-height: 100vh;
      }

      .solicitudes-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .solicitudes-header h2 {
        color: #1f2937;
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
      }

      .solicitudes-subtitle {
        color: #6b7280;
        margin: 0.15rem 0 0 0;
        font-size: 0.9rem;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      .btn-refrescar, .btn-descargar-csv {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        font-size: 0.85rem;
      }

      .btn-refrescar {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .btn-nueva-solicitud {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
        font-size: 0.85rem;
      }

      .btn-descargar-csv {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
      }

      .filtros-container {
        background: white;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
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
        gap: 0.5rem;
        min-width: 160px;
      }

      .filtros-grupo label {
        font-weight: 500;
        color: #374151;
        font-size: 0.85rem;
      }

      .filtro-select {
        padding: 0.4rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        color: #374151;
        font-size: 0.8rem;
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .resumen-filtros {
        color: #6b7280;
        font-size: 0.8rem;
      }

      .solicitudes-lista {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        padding: 1rem;
        border: 1px solid #e5e7eb;
      }

      .solicitudes-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* ===== TARJETA PRINCIPAL - ULTRA COMPACTA CON COLORES DE ESTADO ===== */
      .solicitud-card-nueva {
        border-radius: 12px;
        border: 2px solid;
        padding: 0;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      .solicitud-card-nueva:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
      }

      /* COLORES DE FONDO SEGÚN ESTADO */
      .solicitud-card-nueva.estado-pendiente {
        background: linear-gradient(135deg, #fed7aa, #fdba74);
        border-color: #ea580c;
      }

      .solicitud-card-nueva.estado-emitida {
        background: linear-gradient(135deg, #d1fae5, #bbf7d0);
        border-color: #10b981;
      }

      .solicitud-card-nueva.estado-cancelada {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        border-color: #ef4444;
      }

      /* Línea de estado lateral más prominente */
      .solicitud-card-nueva::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 6px;
        transition: all 0.3s ease;
      }

      .solicitud-card-nueva.estado-pendiente::before {
        background: linear-gradient(180deg, #ea580c, #c2410c);
      }

      .solicitud-card-nueva.estado-emitida::before {
        background: linear-gradient(180deg, #10b981, #059669);
      }

      .solicitud-card-nueva.estado-cancelada::before {
        background: linear-gradient(180deg, #ef4444, #dc2626);
      }

      /* ===== HEADER MÁXIMAMENTE COMPACTO ===== */
      .solicitud-header-nueva {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.35rem 0.6rem;
        background: rgba(255, 255, 255, 0.7);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
      }

      .numero-solicitud-nueva {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .numero-icono {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
      }

      .numero-texto {
        font-size: 0.85rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .header-derecha {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .monto-principal {
        font-size: 1.35rem;
        font-weight: 800;
        color: #059669;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      /* ===== BADGES DE ESTADO COMPACTOS ===== */
      .estado-badge-nueva {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .estado-badge-nueva.estado-pendiente {
        background: linear-gradient(135deg, #fed7aa, #fdba74);
        color: #9a3412;
        border: 1px solid #ea580c;
      }

      .estado-badge-nueva.estado-emitida {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #065f46;
        border: 1px solid #10b981;
      }

      .estado-badge-nueva.estado-cancelada {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #991b1b;
        border: 1px solid #ef4444;
      }

      /* ===== BLOQUES DE SECCIÓN MÁXIMAMENTE COMPACTOS ===== */
      .bloque-seccion {
        padding: 0.25rem 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.5);
      }

      .bloque-seccion:last-of-type {
        border-bottom: none;
      }

      .bloque-seccion:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      .seccion-header {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.15rem;
      }

      .seccion-icono {
        width: 26px;
        height: 26px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .cliente-icono {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }

      .guia-icono {
        background: linear-gradient(135deg, #ea580c, #c2410c);
      }

      .productos-icono {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .fechas-icono {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
      }

      .seccion-titulo {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .seccion-contenido {
        margin-left: 1.3rem;
      }

      /* ===== DATOS EN FILAS MÁXIMAMENTE COMPACTOS ===== */
      .dato-fila {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.1rem;
        padding: 0.02rem 0;
        border-bottom: 1px dotted rgba(0, 0, 0, 0.1);
      }

      .dato-fila:last-child {
        margin-bottom: 0;
        border-bottom: none;
      }

      .dato-label {
        font-size: 0.85rem;
        color: #6b7280;
        font-weight: 500;
        min-width: 80px;
      }

      .dato-valor {
        font-size: 0.85rem;
        color: #374151;
        font-weight: 600;
        text-align: right;
        flex: 1;
      }

      .empresa-nombre {
        color: #1f2937;
        font-size: 0.9rem;
        font-weight: 700;
      }

      .guia-numero {
        color: #c2410c;
        font-weight: 700;
        font-family: 'Courier New', monospace;
        background: #fed7aa;
        padding: 0.15rem 0.3rem;
        border-radius: 4px;
        border: 1px solid #ea580c;
        font-size: 0.8rem;
      }

      /* ===== PRODUCTOS MÁXIMAMENTE COMPACTOS ===== */
      .producto-item-nueva {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        margin-bottom: 0.15rem;
        padding: 0.25rem;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .producto-item-nueva:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.2);
        transform: translateX(2px);
      }

      .producto-item-nueva:last-child {
        margin-bottom: 0;
      }

      .producto-numero-badge {
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
      }

      .producto-detalles {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.7rem;
      }

      .producto-nombre {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1f2937;
        min-width: 100px;
        flex-shrink: 0;
      }

      .producto-info-horizontal {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        flex: 1;
      }

      .producto-info-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        text-align: center;
      }

      .info-label {
        font-size: 0.7rem;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .info-valor {
        font-size: 0.85rem;
        color: #374151;
        font-weight: 600;
      }

      .subtotal-valor {
        color: #059669;
        font-size: 0.9rem;
        font-weight: 700;
      }

      /* ===== TOTAL PRODUCTOS MÁXIMAMENTE COMPACTO ===== */
      .total-productos {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.15rem;
        padding: 0.25rem;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        border: 2px solid #10b981;
      }

      .total-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #065f46;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .total-valor {
        font-size: 1.1rem;
        font-weight: 800;
        color: #047857;
      }

      /* ===== FECHAS CON COLORES ===== */
      .dato-fila.emitida .dato-valor {
        color: #059669;
        font-weight: 700;
      }

      .dato-fila.cancelada .dato-valor {
        color: #dc2626;
        font-weight: 700;
      }

      /* ===== BLOQUE DE ACCIONES MÁXIMAMENTE COMPACTO ===== */
      .bloque-acciones {
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.6);
      }

      .acciones-pendiente {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
      }

      .acciones-completada {
        display: flex;
        justify-content: center;
      }

      .estado-final {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.6rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 20px;
        font-weight: 600;
        color: #6b7280;
        border: 2px solid rgba(0, 0, 0, 0.1);
        font-size: 0.85rem;
      }

      /* ===== BOTONES DE ACCIÓN COMPACTOS ===== */
      .btn-accion {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.8rem;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .btn-accion:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      .btn-accion:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-editar {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: white;
      }

      .btn-emitir {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }

      .btn-cancelar {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
      }

      /* ===== SPINNERS COMPACTOS ===== */
      .spinner-btn {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .spinner-small {
        width: 10px;
        height: 10px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* ===== COMENTARIO DE CANCELACIÓN MÁXIMAMENTE COMPACTO ===== */
      .comentario-cancelacion-nueva {
        margin: 0.25rem;
        margin-top: 0;
        padding: 0.25rem;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        border-left: 3px solid #dc2626;
        box-shadow: 0 1px 2px rgba(239, 68, 68, 0.1);
      }

      .comentario-header-nueva {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        margin-bottom: 0.1rem;
      }

      .comentario-header-nueva span {
        font-size: 0.8rem;
        font-weight: 600;
        color: #991b1b;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .comentario-texto-nueva {
        font-size: 0.8rem;
        color: #7f1d1d;
        margin: 0;
        line-height: 1.4;
        font-style: italic;
        background: rgba(255, 255, 255, 0.7);
        padding: 0.2rem;
        border-radius: 3px;
      }

      /* ===== ESTADOS DE CARGA ===== */
      .loading-state,
      .error-state {
        text-align: center;
        padding: 1.5rem;
      }

      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 0.75rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1.5rem;
        color: #6b7280;
      }

      .empty-state p {
        font-size: 1rem;
        margin-bottom: 0.4rem;
        color: #374151;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* ===== RESPONSIVE DESIGN COMPACTO ===== */

      @media (max-width: 968px) {
        .filtros-container {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
          padding: 0.75rem;
        }
        
        .filtros-grupo {
          min-width: auto;
          flex-direction: column;
          align-items: stretch;
          gap: 0.3rem;
        }

        .solicitud-header-nueva {
          flex-direction: column;
          gap: 0.6rem;
          align-items: stretch;
          padding: 0.6rem 0.75rem;
        }

        .header-derecha {
          justify-content: space-between;
        }

        .producto-info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .producto-info-horizontal {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .producto-detalles {
          flex-direction: column;
          align-items: stretch;
          gap: 0.3rem;
        }

        .acciones-pendiente {
          flex-direction: column;
          gap: 0.4rem;
        }
      }

      @media (max-width: 768px) {
        .solicitudes-container {
          padding: 0.75rem;
        }

        .solicitudes-header {
          flex-direction: column;
          gap: 0.75rem;
          align-items: stretch;
        }

        .header-actions {
          flex-direction: column;
          gap: 0.5rem;
        }

        .numero-solicitud-nueva {
          flex-direction: column;
          text-align: center;
          gap: 0.3rem;
        }

        .seccion-contenido {
          margin-left: 0;
        }

        .dato-fila {
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          padding: 0.2rem 0;
        }

        .dato-valor {
          text-align: left;
          margin-top: 0.15rem;
        }

        .producto-item-nueva {
          flex-direction: column;
          align-items: stretch;
          padding: 0.5rem;
          gap: 0.4rem;
        }

        .total-productos {
          flex-direction: column;
          gap: 0.3rem;
          text-align: center;
          padding: 0.5rem;
        }

        .bloque-seccion {
          padding: 0.6rem 0.75rem;
        }

        .bloque-acciones {
          padding: 0.6rem 0.75rem;
        }
      }
      `}</style>
    </div>
  );
};

export default Solicitudes;