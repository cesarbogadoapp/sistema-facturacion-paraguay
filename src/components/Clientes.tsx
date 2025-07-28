// src/components/Clientes.tsx
import React, { useState, useEffect } from 'react';
import { 
  obtenerClientes,
  crearCliente,
  buscarClientes,
  obtenerSolicitudes
} from '../services/database';
import { Cliente, Solicitud } from '../types/interfaces';
import { validarRUC, validarEmail, formatearMontoConSimbolo, formatearFecha } from '../utils';

interface ClientesProps {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

interface FormularioCliente {
  ruc: string;
  razonSocial: string;
  email: string;
}

interface ErroresFormulario {
  [campo: string]: string;
}

interface EstadisticasCliente {
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesEmitidas: number;
  solicitudesCanceladas: number;
  montoTotal: number;
}

const Clientes: React.FC<ClientesProps> = ({ mostrarNotificacion }) => {
  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [datosFormulario, setDatosFormulario] = useState<FormularioCliente>({
    ruc: '',
    razonSocial: '',
    email: ''
  });
  const [errores, setErrores] = useState<ErroresFormulario>({});

  // Estados para búsqueda y filtros
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [estadisticasCliente, setEstadisticasCliente] = useState<EstadisticasCliente | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    filtrarClientes();
  }, [terminoBusqueda, clientes]);

  const cargarDatos = async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const [datosClientes, datosSolicitudes] = await Promise.all([
        obtenerClientes(),
        obtenerSolicitudes()
      ]);
      
      setClientes(datosClientes);
      setSolicitudes(datosSolicitudes);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
      mostrarNotificacion('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const filtrarClientes = (): void => {
    if (!terminoBusqueda.trim()) {
      setClientesFiltrados(clientes);
      return;
    }

    const clientesFiltrados = clientes.filter(cliente => 
      cliente.razonSocial.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      cliente.ruc.includes(terminoBusqueda) ||
      cliente.email.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    setClientesFiltrados(clientesFiltrados);
  };

  const limpiarFormulario = (): void => {
    setDatosFormulario({
      ruc: '',
      razonSocial: '',
      email: ''
    });
    setErrores({});
  };

  const actualizarCampoFormulario = (campo: keyof FormularioCliente, valor: string): void => {
    setDatosFormulario(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    // Validar RUC
    if (!datosFormulario.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es obligatorio';
    } else if (!validarRUC(datosFormulario.ruc)) {
      nuevosErrores.ruc = 'El formato del RUC no es válido';
    } else {
      // Verificar si el RUC ya existe
      const rucExistente = clientes.find(c => c.ruc === datosFormulario.ruc.trim());
      if (rucExistente) {
        nuevosErrores.ruc = 'Ya existe un cliente con este RUC';
      }
    }

    // Validar razón social
    if (!datosFormulario.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria';
    } else if (datosFormulario.razonSocial.trim().length < 3) {
      nuevosErrores.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!datosFormulario.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!validarEmail(datosFormulario.email)) {
      nuevosErrores.email = 'El formato del email no es válido';
    } else {
      // Verificar si el email ya existe
      const emailExistente = clientes.find(c => c.email.toLowerCase() === datosFormulario.email.toLowerCase().trim());
      if (emailExistente) {
        nuevosErrores.email = 'Ya existe un cliente con este email';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvioFormulario = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      mostrarNotificacion('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    setGuardando(true);
    try {
      const nuevoCliente = await crearCliente({
        ruc: datosFormulario.ruc.trim(),
        razonSocial: datosFormulario.razonSocial.trim(),
        email: datosFormulario.email.toLowerCase().trim()
      });

      setClientes(prev => [nuevoCliente, ...prev]);
      limpiarFormulario();
      setMostrarFormulario(false);
      mostrarNotificacion('Cliente creado exitosamente', 'success');
    } catch (error) {
      console.error('Error creando cliente:', error);
      mostrarNotificacion('Error al crear el cliente', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const calcularEstadisticasCliente = (cliente: Cliente): EstadisticasCliente => {
    const solicitudesCliente = solicitudes.filter(s => s.cliente.ruc === cliente.ruc);
    
    return {
      totalSolicitudes: solicitudesCliente.length,
      solicitudesPendientes: solicitudesCliente.filter(s => s.estado === 'pendiente').length,
      solicitudesEmitidas: solicitudesCliente.filter(s => s.estado === 'emitida').length,
      solicitudesCanceladas: solicitudesCliente.filter(s => s.estado === 'cancelada').length,
      montoTotal: solicitudesCliente
        .filter(s => s.estado === 'emitida')
        .reduce((total, s) => total + s.monto, 0)
    };
  };

  const verDetallesCliente = (cliente: Cliente): void => {
    setClienteSeleccionado(cliente);
    setEstadisticasCliente(calcularEstadisticasCliente(cliente));
  };

  const cerrarDetalles = (): void => {
    setClienteSeleccionado(null);
    setEstadisticasCliente(null);
  };

  if (cargando) {
    return (
      <div className="clientes-container">
        <div className="clientes-header">
          <h2>Clientes</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clientes-container">
        <div className="clientes-header">
          <h2>Clientes</h2>
        </div>
        <div className="error-state">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
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
    <div className="clientes-container">
      {/* Header */}
      <div className="clientes-header">
        <div>
          <h2>Gestión de Clientes</h2>
          <p className="clientes-subtitle">Administra la información de tus clientes</p>
        </div>
        <button 
          onClick={() => setMostrarFormulario(true)}
          className="btn-nuevo-cliente"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-container">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{clientes.length}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {clientes.filter(c => {
                const solicitudesCliente = solicitudes.filter(s => s.cliente.ruc === c.ruc);
                return solicitudesCliente.some(s => s.estado === 'emitida');
              }).length}
            </div>
            <div className="stat-label">Clientes Activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{clientesFiltrados.length}</div>
            <div className="stat-label">Mostrando</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="busqueda-container">
        <div className="busqueda-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por RUC, razón social o email..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
        </div>
        {terminoBusqueda && (
          <button 
            onClick={() => setTerminoBusqueda('')}
            className="btn-limpiar-busqueda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="clientes-lista">
        {clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p>
              {terminoBusqueda 
                ? `No se encontraron clientes con "${terminoBusqueda}"`
                : 'No hay clientes registrados'
              }
            </p>
            <span>
              {!terminoBusqueda && 'Crea tu primer cliente usando el botón "Nuevo Cliente"'}
            </span>
          </div>
        ) : (
          <div className="clientes-grid">
            {clientesFiltrados.map((cliente) => {
              const stats = calcularEstadisticasCliente(cliente);
              return (
                <div key={cliente.id} className="cliente-card">
                  <div className="cliente-header">
                    <div className="cliente-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="cliente-info">
                      <h4>{cliente.razonSocial}</h4>
                      <p className="cliente-ruc">RUC: {cliente.ruc}</p>
                    </div>
                  </div>

                  <div className="cliente-contacto">
                    <div className="contacto-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span>{cliente.email}</span>
                    </div>
                    <div className="contacto-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span>Registrado: {formatearFecha(cliente.fechaCreacion)}</span>
                    </div>
                  </div>

                  <div className="cliente-estadisticas">
                    <div className="mini-stat">
                      <span className="mini-stat-number">{stats.totalSolicitudes}</span>
                      <span className="mini-stat-label">Solicitudes</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-number">{stats.solicitudesEmitidas}</span>
                      <span className="mini-stat-label">Emitidas</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-number">{formatearMontoConSimbolo(stats.montoTotal)}</span>
                      <span className="mini-stat-label">Total Facturado</span>
                    </div>
                  </div>

                  <div className="cliente-acciones">
                    <button 
                      onClick={() => verDetallesCliente(cliente)}
                      className="btn-ver-detalles"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Cliente</h3>
              <button 
                onClick={() => setMostrarFormulario(false)}
                className="modal-close"
                disabled={guardando}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={manejarEnvioFormulario} className="formulario-cliente">
              <div className="form-group">
                <label htmlFor="ruc">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  RUC
                </label>
                <input
                  type="text"
                  id="ruc"
                  value={datosFormulario.ruc}
                  onChange={(e) => actualizarCampoFormulario('ruc', e.target.value)}
                  placeholder="Ej: 12345678-9"
                  disabled={guardando}
                  className={errores.ruc ? 'error' : ''}
                />
                {errores.ruc && <span className="error-mensaje">{errores.ruc}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="razonSocial">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Razón Social
                </label>
                <input
                  type="text"
                  id="razonSocial"
                  value={datosFormulario.razonSocial}
                  onChange={(e) => actualizarCampoFormulario('razonSocial', e.target.value)}
                  placeholder="Ej: Mi Empresa SRL"
                  disabled={guardando}
                  className={errores.razonSocial ? 'error' : ''}
                />
                {errores.razonSocial && <span className="error-mensaje">{errores.razonSocial}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={datosFormulario.email}
                  onChange={(e) => actualizarCampoFormulario('email', e.target.value)}
                  placeholder="Ej: contacto@miempresa.com"
                  disabled={guardando}
                  className={errores.email ? 'error' : ''}
                />
                {errores.email && <span className="error-mensaje">{errores.email}</span>}
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="btn-secondary"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles del cliente */}
      {clienteSeleccionado && estadisticasCliente && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-content modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Cliente</h3>
              <button onClick={cerrarDetalles} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="detalles-contenido">
              <div className="cliente-info-completa">
                <div className="info-item">
                  <span className="info-label">Razón Social:</span>
                  <span className="info-valor">{clienteSeleccionado.razonSocial}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">RUC:</span>
                  <span className="info-valor">{clienteSeleccionado.ruc}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-valor">{clienteSeleccionado.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de Registro:</span>
                  <span className="info-valor">{formatearFecha(clienteSeleccionado.fechaCreacion)}</span>
                </div>
              </div>

              <div className="estadisticas-detalladas">
                <h4>Estadísticas de Facturación</h4>
                <div className="stats-grid">
                  <div className="stat-detail">
                    <div className="stat-detail-number">{estadisticasCliente.totalSolicitudes}</div>
                    <div className="stat-detail-label">Total Solicitudes</div>
                  </div>
                  <div className="stat-detail">
                    <div className="stat-detail-number">{estadisticasCliente.solicitudesPendientes}</div>
                    <div className="stat-detail-label">Pendientes</div>
                  </div>
                  <div className="stat-detail">
                    <div className="stat-detail-number">{estadisticasCliente.solicitudesEmitidas}</div>
                    <div className="stat-detail-label">Emitidas</div>
                  </div>
                  <div className="stat-detail">
                    <div className="stat-detail-number">{estadisticasCliente.solicitudesCanceladas}</div>
                    <div className="stat-detail-label">Canceladas</div>
                  </div>
                </div>
                
                <div className="monto-total">
                  <span className="monto-label">Total Facturado:</span>
                  <span className="monto-valor">{formatearMontoConSimbolo(estadisticasCliente.montoTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .clientes-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .clientes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .clientes-header h2 {
          color: #1f2937;
          margin: 0;
          font-size: 1.875rem;
          font-weight: 700;
        }

        .clientes-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0 0;
          font-size: 1rem;
        }

        .btn-nuevo-cliente {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-nuevo-cliente:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .estadisticas-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
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

        .stat-icon-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .stat-icon-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-icon-info {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .busqueda-container {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .busqueda-input {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .busqueda-input svg {
          position: absolute;
          left: 0.75rem;
          color: #9ca3af;
          z-index: 1;
        }

        .busqueda-input input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .busqueda-input input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-limpiar-busqueda {
          padding: 0.75rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-limpiar-busqueda:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .clientes-lista {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
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

        .clientes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .cliente-card {
          border: 2px solid #f3f4f6;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
          background: #fafafa;
        }

        .cliente-card:hover {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }

        .cliente-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .cliente-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .cliente-info h4 {
          margin: 0;
          color: #1f2937;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .cliente-ruc {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }

        .cliente-contacto {
          margin-bottom: 1rem;
        }

        .contacto-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .contacto-item svg {
          flex-shrink: 0;
        }

        .cliente-estadisticas {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .mini-stat {
          text-align: center;
        }

        .mini-stat-number {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
        }

        .mini-stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .cliente-acciones {
          display: flex;
          gap: 0.75rem;
        }

        .btn-ver-detalles {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-ver-detalles:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-detalles {
          max-width: 600px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .formulario-cliente {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-group input:disabled {
          background-color: #f9fafb;
          opacity: 0.6;
        }

        .form-group input.error {
          border-color: #dc2626;
        }

        .error-mensaje {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: block;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .detalles-contenido {
          padding: 1.5rem;
        }

        .cliente-info-completa {
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
        }

        .info-valor {
          color: #1f2937;
          font-weight: 500;
        }

        .estadisticas-detalladas h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-detail {
          text-align: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .stat-detail-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-detail-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .monto-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 8px;
        }

        .monto-label {
          font-weight: 500;
        }

        .monto-valor {
          font-size: 1.25rem;
          font-weight: 700;
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
          border-top: 4px solid #10b981;
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
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
          margin-top: 1rem;
        }

        .btn-retry:hover {
          background: #059669;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .clientes-container {
            padding: 1rem;
          }

          .clientes-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .estadisticas-container {
            grid-template-columns: 1fr;
          }

          .busqueda-container {
            flex-direction: column;
            align-items: stretch;
          }

          .clientes-grid {
            grid-template-columns: 1fr;
          }

          .cliente-estadisticas {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-content {
            max-height: 95vh;
          }

          .modal-header {
            padding: 1rem;
          }

          .formulario-cliente {
            padding: 1rem;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Clientes;