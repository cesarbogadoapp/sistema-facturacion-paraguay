// src/components/FormularioSolicitud.tsx
import React, { useState, useEffect } from 'react';
import { crearSolicitud, obtenerClientes, obtenerProductos } from '../services/database';
import { validarRUC, formatearMonto } from '../utils';
import { Cliente, Producto } from '../types/interfaces';

interface FormularioSolicitudProps {
  mostrar: boolean;
  onCerrar: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
  onSolicitudCreada?: () => void;
}

interface DatosFormulario {
  ruc: string;
  razonSocial: string;
  email: string;
  productoId: string;
  monto: string;
}

interface ErroresValidacion {
  [campo: string]: string;
}

const FormularioSolicitud: React.FC<FormularioSolicitudProps> = ({ 
  mostrar, 
  onCerrar, 
  mostrarNotificacion,
  onSolicitudCreada 
}) => {
  // Estados principales
  const [datosFormulario, setDatosFormulario] = useState<DatosFormulario>({
    ruc: '',
    razonSocial: '',
    email: '',
    productoId: '',
    monto: ''
  });

  const [errores, setErrores] = useState<ErroresValidacion>({});
  const [cargando, setCargando] = useState<boolean>(false);
  const [cargandoData, setCargandoData] = useState<boolean>(true);

  // Estados para datos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Estados para autocompletado
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState<boolean>(false);

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (mostrar) {
      cargarDatosIniciales();
    }
  }, [mostrar]);

  // Función para cargar clientes y productos
  const cargarDatosIniciales = async (): Promise<void> => {
    setCargandoData(true);
    try {
      const [datosClientes, datosProductos] = await Promise.all([
        obtenerClientes(),
        obtenerProductos()
      ]);
      
      setClientes(datosClientes);
      setProductos(datosProductos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarNotificacion('Error al cargar los datos necesarios', 'error');
    } finally {
      setCargandoData(false);
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = (): void => {
    setDatosFormulario({
      ruc: '',
      razonSocial: '',
      email: '',
      productoId: '',
      monto: ''
    });
    setErrores({});
    setClientesSugeridos([]);
    setMostrandoSugerencias(false);
  };

  // Función para manejar cambios en los campos
  const actualizarCampo = (nombreCampo: keyof DatosFormulario, valor: string): void => {
    setDatosFormulario(estadoAnterior => ({ 
      ...estadoAnterior, 
      [nombreCampo]: valor 
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[nombreCampo]) {
      setErrores(erroresAnteriores => ({ 
        ...erroresAnteriores, 
        [nombreCampo]: '' 
      }));
    }

    // Manejar búsqueda de clientes para RUC y razón social
    if (nombreCampo === 'ruc' || nombreCampo === 'razonSocial') {
      buscarClientesCoincidentes(nombreCampo, valor);
    }

    // Formatear monto (solo números)
    if (nombreCampo === 'monto') {
      const numerosSolo = valor.replace(/[^\d]/g, '');
      setDatosFormulario(estadoAnterior => ({ 
        ...estadoAnterior, 
        monto: numerosSolo 
      }));
    }
  };

  // Función para buscar clientes que coincidan
  const buscarClientesCoincidentes = (tipoBusqueda: string, valorBusqueda: string): void => {
    if (!valorBusqueda.trim()) {
      setClientesSugeridos([]);
      setMostrandoSugerencias(false);
      return;
    }

    const clientesEncontrados = clientes.filter(cliente => {
      if (tipoBusqueda === 'ruc') {
        return cliente.ruc.toLowerCase().includes(valorBusqueda.toLowerCase());
      } else {
        return cliente.razonSocial.toLowerCase().includes(valorBusqueda.toLowerCase());
      }
    });

    setClientesSugeridos(clientesEncontrados);
    setMostrandoSugerencias(clientesEncontrados.length > 0);
  };

  // Función para seleccionar un cliente de las sugerencias
  const seleccionarClienteSugerido = (clienteSeleccionado: Cliente): void => {
    setDatosFormulario(estadoAnterior => ({
      ...estadoAnterior,
      ruc: clienteSeleccionado.ruc,
      razonSocial: clienteSeleccionado.razonSocial,
      email: clienteSeleccionado.email
    }));
    setMostrandoSugerencias(false);
    setClientesSugeridos([]);
  };

  // Función para validar todos los campos del formulario
  const validarTodosLosCampos = (): boolean => {
    const nuevosErrores: ErroresValidacion = {};

    // Validar RUC
    if (!datosFormulario.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es obligatorio';
    } else if (!validarRUC(datosFormulario.ruc)) {
      nuevosErrores.ruc = 'El formato del RUC no es válido';
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
    } else {
      const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!patronEmail.test(datosFormulario.email)) {
        nuevosErrores.email = 'El formato del email no es válido';
      }
    }

    // Validar producto
    if (!datosFormulario.productoId) {
      nuevosErrores.productoId = 'Debe seleccionar un producto';
    }

    // Validar monto
    if (!datosFormulario.monto) {
      nuevosErrores.monto = 'El monto es obligatorio';
    } else {
      const montoNumerico = parseInt(datosFormulario.monto);
      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        nuevosErrores.monto = 'El monto debe ser un número mayor a 0';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para manejar el envío del formulario
  const procesarEnvioFormulario = async (evento: React.FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    
    if (!validarTodosLosCampos()) {
      mostrarNotificacion('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    setCargando(true);
    try {
      // Buscar datos del cliente existente o crear estructura nueva
      const datosCliente = clientes.find(c => c.ruc === datosFormulario.ruc) || {
        ruc: datosFormulario.ruc,
        razonSocial: datosFormulario.razonSocial,
        email: datosFormulario.email
      };

      // Buscar datos del producto seleccionado
      const productoSeleccionado = productos.find(p => p.id === datosFormulario.productoId);

      if (!productoSeleccionado) {
        throw new Error('El producto seleccionado no fue encontrado');
      }

      // Preparar datos para crear la solicitud
      const datosSolicitud = {
        clienteId: datosCliente.id || null,
        productoId: datosFormulario.productoId,
        monto: parseInt(datosFormulario.monto),
        cliente: {
          ruc: datosFormulario.ruc,
          razonSocial: datosFormulario.razonSocial,
          email: datosFormulario.email
        },
        producto: {
          nombre: productoSeleccionado.nombre
        }
      };

      // Crear la solicitud en la base de datos
      await crearSolicitud(datosSolicitud);
      
      // Mostrar mensaje de éxito
      mostrarNotificacion('Solicitud creada correctamente', 'success');
      
      // Limpiar formulario y cerrar modal
      limpiarFormulario();
      onCerrar();
      
      // Notificar al componente padre si existe callback
      if (onSolicitudCreada) {
        onSolicitudCreada();
      }
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      mostrarNotificacion('Error al crear la solicitud', 'error');
    } finally {
      setCargando(false);
    }
  };

  // Función para cerrar el modal
  const cerrarModal = (): void => {
    if (!cargando) {
      limpiarFormulario();
      onCerrar();
    }
  };

  // No renderizar nada si el modal no debe mostrarse
  if (!mostrar) return null;

  return (
    <div className="overlay-modal" onClick={cerrarModal}>
      <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del modal */}
        <div className="encabezado-modal">
          <h2>Nueva Solicitud de Facturación</h2>
          <button 
            className="boton-cerrar" 
            onClick={cerrarModal}
            disabled={cargando}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Contenido principal */}
        {cargandoData ? (
          <div className="contenedor-carga">
            <div className="spinner-carga"></div>
            <p>Cargando información necesaria...</p>
          </div>
        ) : (
          <form onSubmit={procesarEnvioFormulario} className="formulario-principal">
            {/* Sección de datos del cliente */}
            <div className="seccion-datos">
              <h3 className="titulo-seccion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Información del Cliente
              </h3>
              
              {/* Campo RUC */}
              <div className="grupo-campo">
                <label htmlFor="campo-ruc" className="etiqueta-campo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  RUC
                </label>
                <input
                  type="text"
                  id="campo-ruc"
                  value={datosFormulario.ruc}
                  onChange={(e) => actualizarCampo('ruc', e.target.value)}
                  placeholder="Ej: 12345678-9"
                  disabled={cargando}
                  className={`campo-entrada ${errores.ruc ? 'campo-error' : ''}`}
                />
                {errores.ruc && <span className="mensaje-error">{errores.ruc}</span>}
                
                {/* Lista de sugerencias de clientes */}
                {mostrandoSugerencias && (
                  <div className="lista-sugerencias">
                    {clientesSugeridos.map((cliente) => (
                      <div 
                        key={cliente.id}
                        className="item-sugerencia"
                        onClick={() => seleccionarClienteSugerido(cliente)}
                      >
                        <div className="info-cliente-sugerido">
                          <span className="ruc-sugerido">{cliente.ruc}</span>
                          <span className="nombre-sugerido">{cliente.razonSocial}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campo Razón Social */}
              <div className="grupo-campo">
                <label htmlFor="campo-razon-social" className="etiqueta-campo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Razón Social
                </label>
                <input
                  type="text"
                  id="campo-razon-social"
                  value={datosFormulario.razonSocial}
                  onChange={(e) => actualizarCampo('razonSocial', e.target.value)}
                  placeholder="Ej: Mi Empresa SRL"
                  disabled={cargando}
                  className={`campo-entrada ${errores.razonSocial ? 'campo-error' : ''}`}
                />
                {errores.razonSocial && <span className="mensaje-error">{errores.razonSocial}</span>}
              </div>

              {/* Campo Email */}
              <div className="grupo-campo">
                <label htmlFor="campo-email" className="etiqueta-campo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="campo-email"
                  value={datosFormulario.email}
                  onChange={(e) => actualizarCampo('email', e.target.value)}
                  placeholder="Ej: contacto@miempresa.com"
                  disabled={cargando}
                  className={`campo-entrada ${errores.email ? 'campo-error' : ''}`}
                />
                {errores.email && <span className="mensaje-error">{errores.email}</span>}
              </div>
            </div>

            {/* Sección de datos del producto */}
            <div className="seccion-datos">
              <h3 className="titulo-seccion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Información del Producto
              </h3>
              
              {/* Campo Producto */}
              <div className="grupo-campo">
                <label htmlFor="campo-producto" className="etiqueta-campo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Producto a Facturar
                </label>
                <select
                  id="campo-producto"
                  value={datosFormulario.productoId}
                  onChange={(e) => actualizarCampo('productoId', e.target.value)}
                  disabled={cargando}
                  className={`campo-entrada ${errores.productoId ? 'campo-error' : ''}`}
                >
                  <option value="">-- Seleccione un producto --</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
                {errores.productoId && <span className="mensaje-error">{errores.productoId}</span>}
                
                {productos.length === 0 && (
                  <div className="mensaje-informativo">
                    No hay productos disponibles. Debe crear productos primero en la sección "Productos".
                  </div>
                )}
              </div>

              {/* Campo Monto */}
              <div className="grupo-campo">
                <label htmlFor="campo-monto" className="etiqueta-campo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Monto (en Guaraníes)
                </label>
                <input
                  type="text"
                  id="campo-monto"
                  value={datosFormulario.monto ? formatearMonto(datosFormulario.monto) : ''}
                  onChange={(e) => actualizarCampo('monto', e.target.value)}
                  placeholder="Ej: 150,000"
                  disabled={cargando}
                  className={`campo-entrada ${errores.monto ? 'campo-error' : ''}`}
                />
                {errores.monto && <span className="mensaje-error">{errores.monto}</span>}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="contenedor-botones">
              <button 
                type="button"
                onClick={cerrarModal}
                className="boton-secundario"
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="boton-principal"
                disabled={cargando || productos.length === 0}
              >
                {cargando ? 'Creando Solicitud...' : 'Crear Solicitud'}
              </button>
            </div>
          </form>
        )}

        <style>{`
          .overlay-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .contenido-modal {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }

          .encabezado-modal {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 16px 16px 0 0;
          }

          .encabezado-modal h2 {
            margin: 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .boton-cerrar {
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

          .boton-cerrar:hover:not(:disabled) {
            background: #e5e7eb;
            color: #374151;
          }

          .boton-cerrar:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .contenedor-carga {
            padding: 4rem 2rem;
            text-align: center;
          }

          .spinner-carga {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: girar 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes girar {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .formulario-principal {
            padding: 1.5rem;
          }

          .seccion-datos {
            margin-bottom: 2rem;
          }

          .seccion-datos:last-of-type {
            margin-bottom: 1.5rem;
          }

          .titulo-seccion {
            margin: 0 0 1.5rem 0;
            color: #374151;
            font-size: 1.125rem;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .grupo-campo {
            margin-bottom: 1.25rem;
            position: relative;
          }

          .etiqueta-campo {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
            gap: 0.5rem;
            font-size: 0.875rem;
          }

          .campo-entrada {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
            box-sizing: border-box;
          }

          .campo-entrada:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .campo-entrada:disabled {
            background-color: #f9fafb;
            opacity: 0.6;
            cursor: not-allowed;
          }

          .campo-entrada.campo-error {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }

          .mensaje-error {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            display: block;
            font-weight: 500;
          }

          .mensaje-informativo {
            color: #059669;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            padding: 0.75rem;
            background: #ecfdf5;
            border-radius: 6px;
            border: 1px solid #a7f3d0;
          }

          .lista-sugerencias {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 10;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .item-sugerencia {
            padding: 0.75rem;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s;
          }

          .item-sugerencia:hover {
            background: #f9fafb;
          }

          .item-sugerencia:last-child {
            border-bottom: none;
          }

          .info-cliente-sugerido {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .ruc-sugerido {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.875rem;
          }

          .nombre-sugerido {
            color: #6b7280;
            font-size: 0.875rem;
          }

          .contenedor-botones {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          .boton-principal,
          .boton-secundario {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 120px;
          }

          .boton-principal {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
          }

          .boton-principal:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .boton-principal:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .boton-secundario {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .boton-secundario:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
          }

          .boton-secundario:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .overlay-modal {
              padding: 0.5rem;
            }

            .contenido-modal {
              max-height: 95vh;
            }

            .encabezado-modal {
              padding: 1rem;
            }

            .formulario-principal {
              padding: 1rem;
            }

            .contenedor-botones {
              flex-direction: column-reverse;
            }

            .boton-principal,
            .boton-secundario {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FormularioSolicitud;