// ModalEdicionCompleto.tsx - CON TODOS LOS CAMPOS DEL FORMULARIO MEJORADO Y CENTRADO AUTOMÁTICO
import React, { useState, useEffect, useRef } from 'react';
import { actualizarSolicitud } from '../services/database';
import { validarRUC, formatearMonto } from '../utils';
import { Solicitud, Cliente, Producto, ProductoSolicitud } from '../types/interfaces';

interface ModalEdicionCompletoProps {
  mostrar: boolean;
  solicitud: Solicitud | null;
  onGuardar: (solicitudEditada: any) => void;
  onCancelar: () => void;
  cargando: boolean;
  clientes: Cliente[];
  productos: Producto[];
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

interface DatosEdicion {
  ruc: string;
  razonSocial: string;
  email: string;
  productos: ProductoSolicitud[];
  numeroGuia: string;
}

const ModalEdicionCompleto: React.FC<ModalEdicionCompletoProps> = ({
  mostrar,
  solicitud,
  onGuardar,
  onCancelar,
  cargando,
  clientes,
  productos,
  mostrarNotificacion
}) => {
  // ✨ REF PARA CENTRADO AUTOMÁTICO
  const modalRef = useRef<HTMLDivElement>(null);

  const [datosEdicion, setDatosEdicion] = useState<DatosEdicion>({
    ruc: '',
    razonSocial: '',
    email: '',
    productos: [{ productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }],
    numeroGuia: ''
  });

  const [errores, setErrores] = useState<any>({});
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState<boolean>(false);
  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // ✨ EFECTO PARA CENTRADO AUTOMÁTICO DEL MODAL
  useEffect(() => {
    if (mostrar) {
      // Usar setTimeout para asegurar que el DOM esté renderizado
      setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 0);
    }
  }, [mostrar]);

  // Cargar datos de la solicitud al abrir el modal
  useEffect(() => {
    if (solicitud && mostrar) {
      console.log('🔄 Cargando datos de solicitud para edición:', solicitud);
      
      // Verificar si la solicitud tiene múltiples productos o formato legacy
      let productosParaEdicion: ProductoSolicitud[] = [];
      
      if (solicitud.productos && solicitud.productos.length > 0) {
        // Formato nuevo con múltiples productos
        productosParaEdicion = solicitud.productos.map(prod => ({
          productoId: prod.productoId,
          nombre: prod.nombre,
          cantidad: prod.cantidad || 1,
          precioUnitario: prod.precioUnitario || 0,
          subtotal: prod.subtotal || 0
        }));
      } else {
        // Formato legacy - convertir a formato nuevo
        productosParaEdicion = [{
          productoId: solicitud.productoId,
          nombre: solicitud.producto.nombre,
          cantidad: 1,
          precioUnitario: solicitud.monto,
          subtotal: solicitud.monto
        }];
      }

      setDatosEdicion({
        ruc: solicitud.cliente.ruc,
        razonSocial: solicitud.cliente.razonSocial,
        email: solicitud.cliente.email,
        productos: productosParaEdicion,
        numeroGuia: solicitud.numeroGuia || ''
      });

      // Mostrar campo de guía si ya tiene número
      setMostrarGuia(Boolean(solicitud.numeroGuia));
      
      console.log('✅ Datos cargados para edición:', {
        productos: productosParaEdicion,
        numeroGuia: solicitud.numeroGuia
      });
    }
  }, [solicitud, mostrar]);

  // Limpiar al cerrar
  useEffect(() => {
    if (!mostrar) {
      setErrores({});
      setClientesSugeridos([]);
      setMostrandoSugerencias(false);
      setMostrarGuia(false);
    }
  }, [mostrar]);

  // Funciones para manejar productos
  const agregarProducto = () => {
    setDatosEdicion(prev => ({
      ...prev,
      productos: [...prev.productos, { productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    }));
  };

  const eliminarProducto = (index: number) => {
    if (datosEdicion.productos.length > 1) {
      setDatosEdicion(prev => ({
        ...prev,
        productos: prev.productos.filter((_, i) => i !== index)
      }));
    }
  };

  const actualizarProducto = (index: number, campo: keyof ProductoSolicitud, valor: any) => {
    setDatosEdicion(prev => {
      const nuevosProductos = [...prev.productos];
      nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
      
      // Si cambia el producto, actualizar nombre y limpiar precio
      if (campo === 'productoId') {
        const producto = productos.find(p => p.id === valor);
        if (producto) {
          nuevosProductos[index].nombre = producto.nombre;
          nuevosProductos[index].precioUnitario = 0;
          nuevosProductos[index].subtotal = 0;
        }
      }
      
      // Calcular subtotal
      const cantidad = parseInt(String(nuevosProductos[index].cantidad)) || 0;
      const precio = parseInt(String(nuevosProductos[index].precioUnitario)) || 0;
      nuevosProductos[index].subtotal = cantidad * precio;
      
      return { ...prev, productos: nuevosProductos };
    });

    // Force update para Chrome
    setForceUpdate(prev => prev + 1);
  };

  // Calcular total
  const calcularTotal = (): number => {
    return datosEdicion.productos.reduce((total, prod) => {
      return total + (Number(prod.subtotal) || 0);
    }, 0);
  };

  // Buscar clientes
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

  // Seleccionar cliente
  const seleccionarClienteSugerido = (clienteSeleccionado: Cliente): void => {
    setDatosEdicion(prev => ({
      ...prev,
      ruc: clienteSeleccionado.ruc,
      razonSocial: clienteSeleccionado.razonSocial,
      email: clienteSeleccionado.email
    }));
    setMostrandoSugerencias(false);
    setClientesSugeridos([]);
  };

  // Validar formulario
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

    const productosValidos = datosEdicion.productos.filter(p => p.productoId && p.cantidad > 0 && p.precioUnitario > 0);
    if (productosValidos.length === 0) {
      nuevosErrores.productos = 'Debe tener al menos un producto válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar guardar
  const manejarGuardar = () => {
    if (!validarFormulario()) {
      mostrarNotificacion('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    if (!solicitud) return;

    // Preparar productos válidos
    const productosValidos = datosEdicion.productos.filter(p => p.productoId && p.cantidad > 0 && p.precioUnitario > 0);
    console.log('✅ Productos válidos para guardar:', productosValidos);
    
    // Para compatibilidad, usar el primer producto en los campos legacy
    const primerProducto = productosValidos[0];
    const producto = productos.find(p => p.id === primerProducto.productoId);

    const solicitudEditada = {
      ...solicitud,
      // Datos del cliente
      cliente: {
        ruc: datosEdicion.ruc.trim(),
        razonSocial: datosEdicion.razonSocial.trim(),
        email: datosEdicion.email.trim()
      },
      // Productos múltiples (nuevo formato)
      productos: productosValidos,
      // Número de guía
      numeroGuia: datosEdicion.numeroGuia.trim() || undefined,
      // Campos legacy para compatibilidad
      productoId: primerProducto.productoId,
      producto: {
        nombre: producto?.nombre || primerProducto.nombre
      },
      monto: calcularTotal()
    };

    console.log('📤 Solicitud editada para enviar:', solicitudEditada);
    onGuardar(solicitudEditada);
  };

  if (!mostrar || !solicitud) return null;

  return (
    <div className="overlay-modal-edicion" onClick={() => !cargando && onCancelar()}>
      <div 
        className="contenido-modal-edicion" 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="encabezado-modal-edicion">
          <h2>Editar Solicitud</h2>
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="boton-cerrar-edicion"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="formulario-edicion">
          
          {/* Datos del Cliente */}
          <div className="seccion-edicion">
            <h3 className="titulo-seccion-edicion">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Información del Cliente
            </h3>
            
            {/* RUC */}
            <div className="grupo-campo-edicion">
              <label className="etiqueta-campo-edicion">RUC</label>
              <input
                type="text"
                value={datosEdicion.ruc}
                onChange={(e) => {
                  setDatosEdicion(prev => ({ ...prev, ruc: e.target.value }));
                  buscarClientesCoincidentes('ruc', e.target.value);
                }}
                disabled={cargando}
                className={`campo-entrada-edicion ${errores.ruc ? 'campo-error-edicion' : ''}`}
                placeholder="Ej: 12345678-9"
              />
              {errores.ruc && <span className="mensaje-error-edicion">{errores.ruc}</span>}
              
              {/* Sugerencias */}
              {mostrandoSugerencias && (
                <div className="lista-sugerencias-edicion">
                  {clientesSugeridos.map((cliente) => (
                    <div 
                      key={cliente.id}
                      className="item-sugerencia-edicion"
                      onClick={() => seleccionarClienteSugerido(cliente)}
                    >
                      <span className="ruc-sugerido-edicion">{cliente.ruc}</span>
                      <span className="nombre-sugerido-edicion">{cliente.razonSocial}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Razón Social */}
            <div className="grupo-campo-edicion">
              <label className="etiqueta-campo-edicion">Razón Social</label>
              <input
                type="text"
                value={datosEdicion.razonSocial}
                onChange={(e) => setDatosEdicion(prev => ({ ...prev, razonSocial: e.target.value }))}
                disabled={cargando}
                className={`campo-entrada-edicion ${errores.razonSocial ? 'campo-error-edicion' : ''}`}
                placeholder="Ej: Mi Empresa SRL"
              />
              {errores.razonSocial && <span className="mensaje-error-edicion">{errores.razonSocial}</span>}
            </div>

            {/* Email */}
            <div className="grupo-campo-edicion">
              <label className="etiqueta-campo-edicion">Email</label>
              <input
                type="email"
                value={datosEdicion.email}
                onChange={(e) => setDatosEdicion(prev => ({ ...prev, email: e.target.value }))}
                disabled={cargando}
                className={`campo-entrada-edicion ${errores.email ? 'campo-error-edicion' : ''}`}
                placeholder="Ej: contacto@miempresa.com"
              />
              {errores.email && <span className="mensaje-error-edicion">{errores.email}</span>}
            </div>
          </div>

          {/* Productos */}
          <div className="seccion-edicion">
            <div className="header-productos-edicion">
              <h3 className="titulo-seccion-edicion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Productos ({datosEdicion.productos.length})
              </h3>
              <button
                type="button"
                onClick={agregarProducto}
                className="btn-agregar-producto-edicion"
                disabled={cargando}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Agregar
              </button>
            </div>

            {datosEdicion.productos.map((producto, index) => (
              <div key={index} className="producto-item-edicion">
                <div className="producto-header-edicion">
                  <span className="producto-numero-edicion">#{index + 1}</span>
                  {datosEdicion.productos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarProducto(index)}
                      className="btn-eliminar-producto-edicion"
                      disabled={cargando}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="producto-campos-edicion">
                  {/* Producto */}
                  <div className="grupo-campo-edicion">
                    <label className="etiqueta-campo-edicion">Producto</label>
                    <select
                      value={producto.productoId}
                      onChange={(e) => actualizarProducto(index, 'productoId', e.target.value)}
                      disabled={cargando}
                      className="campo-entrada-edicion"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad */}
                  <div className="grupo-campo-edicion">
                    <label className="etiqueta-campo-edicion">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={producto.cantidad}
                      onChange={(e) => {
                        const nuevaCantidad = parseInt(e.target.value) || 1;
                        actualizarProducto(index, 'cantidad', nuevaCantidad);
                      }}
                      disabled={cargando}
                      className="campo-entrada-edicion"
                    />
                  </div>

                  {/* Precio Unitario */}
                  <div className="grupo-campo-edicion">
                    <label className="etiqueta-campo-edicion">Precio Unit. (Gs.)</label>
                    <input
                      type="text"
                      value={producto.precioUnitario ? formatearMonto(producto.precioUnitario.toString()) : ''}
                      onChange={(e) => {
                        const numeroLimpio = e.target.value.replace(/[^\d]/g, '');
                        const nuevoPrecio = parseInt(numeroLimpio) || 0;
                        actualizarProducto(index, 'precioUnitario', nuevoPrecio);
                      }}
                      disabled={cargando}
                      className="campo-entrada-edicion"
                      placeholder="Ej: 50000"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="grupo-campo-edicion">
                    <label className="etiqueta-campo-edicion">Subtotal</label>
                    <div className="subtotal-display-edicion" key={`subtotal-${index}-${forceUpdate}`}>
                      Gs. {formatearMonto((producto.subtotal || 0).toString())}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {errores.productos && <span className="mensaje-error-edicion">{errores.productos}</span>}

            {/* Total General */}
            <div className="total-general-edicion" key={`total-${forceUpdate}`}>
              <strong>Total: Gs. {formatearMonto(calcularTotal().toString())}</strong>
            </div>
          </div>

          {/* Número de Guía */}
          <div className="seccion-edicion">
            <div className="header-guia-edicion">
              <button
                type="button"
                onClick={() => setMostrarGuia(!mostrarGuia)}
                className="btn-toggle-guia-edicion"
                disabled={cargando}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <path d="M16 8l2 0 0 8-8 0"/>
                  <path d="M21 11.5l-5 5"/>
                </svg>
                {mostrarGuia ? 'Ocultar' : 'Mostrar'} Número de Guía
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ 
                    transform: mostrarGuia ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
            </div>

            {mostrarGuia && (
              <div className="grupo-campo-edicion">
                <label className="etiqueta-campo-edicion">Número de Guía (Opcional)</label>
                <input
                  type="text"
                  value={datosEdicion.numeroGuia}
                  onChange={(e) => setDatosEdicion(prev => ({ ...prev, numeroGuia: e.target.value }))}
                  placeholder="Ej: GU123456789"
                  disabled={cargando}
                  className="campo-entrada-edicion"
                />
                <small className="texto-ayuda-edicion">
                  Número de seguimiento de la empresa logística
                </small>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="contenedor-botones-edicion">
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="boton-secundario-edicion"
            >
              Cancelar
            </button>
            <button
              onClick={manejarGuardar}
              disabled={cargando}
              className="boton-principal-edicion"
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* CSS COMPLETO */}
        <style>{`
          .overlay-modal-edicion {
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

          .contenido-modal-edicion {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            margin: auto;
            position: relative;
          }

          .encabezado-modal-edicion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 16px 16px 0 0;
          }

          .encabezado-modal-edicion h2 {
            margin: 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .boton-cerrar-edicion {
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

          .boton-cerrar-edicion:hover:not(:disabled) {
            background: #e5e7eb;
            color: #374151;
          }

          .formulario-edicion {
            padding: 1.5rem;
          }

          .seccion-edicion {
            margin-bottom: 2rem;
          }

          .titulo-seccion-edicion {
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

          .grupo-campo-edicion {
            margin-bottom: 1.25rem;
            position: relative;
          }

          .etiqueta-campo-edicion {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
            font-size: 0.875rem;
          }

          .campo-entrada-edicion {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
            box-sizing: border-box;
          }

          .campo-entrada-edicion:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .campo-entrada-edicion:disabled {
            background-color: #f9fafb;
            opacity: 0.6;
            cursor: not-allowed;
          }

          .campo-entrada-edicion.campo-error-edicion {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }

          .mensaje-error-edicion {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            display: block;
            font-weight: 500;
          }

          .lista-sugerencias-edicion {
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

          .item-sugerencia-edicion {
            padding: 0.75rem;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s;
          }

          .item-sugerencia-edicion:hover {
            background: #f9fafb;
          }

          .ruc-sugerido-edicion {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.875rem;
            display: block;
          }

          .nombre-sugerido-edicion {
            color: #6b7280;
            font-size: 0.875rem;
            display: block;
            margin-top: 0.25rem;
          }

          .header-productos-edicion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .btn-agregar-producto-edicion {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .btn-agregar-producto-edicion:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }

          .producto-item-edicion {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: #fafafa;
          }

          .producto-header-edicion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .producto-numero-edicion {
            font-weight: 600;
            color: #374151;
            background: #e5e7eb;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
          }

          .btn-eliminar-producto-edicion {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-eliminar-producto-edicion:hover:not(:disabled) {
            background: #dc2626;
            transform: scale(1.1);
          }

          .producto-campos-edicion {
            display: grid;
            grid-template-columns: 2fr 1fr 1.5fr 1.5fr;
            gap: 1rem;
          }

          .subtotal-display-edicion {
            padding: 0.75rem;
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-weight: 600;
            color: #059669;
          }

          .total-general-edicion {
            text-align: right;
            padding: 1rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 8px;
            font-size: 1.125rem;
            margin-top: 1rem;
          }

          .header-guia-edicion {
            margin-bottom: 1rem;
          }

          .btn-toggle-guia-edicion {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            transition: all 0.2s;
            width: 100%;
            justify-content: center;
          }

          .btn-toggle-guia-edicion:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
          }

          .texto-ayuda-edicion {
            color: #6b7280;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
          }

          .contenedor-botones-edicion {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          .boton-principal-edicion,
          .boton-secundario-edicion {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 120px;
          }

          .boton-principal-edicion {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
          }

          .boton-principal-edicion:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .boton-principal-edicion:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .boton-secundario-edicion {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .boton-secundario-edicion:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
          }

          .boton-secundario-edicion:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .overlay-modal-edicion {
              padding: 0.5rem;
            }

            .contenido-modal-edicion {
              max-height: 95vh;
            }

            .encabezado-modal-edicion {
              padding: 1rem;
            }

            .formulario-edicion {
              padding: 1rem;
            }

            .producto-campos-edicion {
              grid-template-columns: 1fr;
            }

            .header-productos-edicion {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }

            .contenedor-botones-edicion {
              flex-direction: column-reverse;
            }

            .boton-principal-edicion,
            .boton-secundario-edicion {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ModalEdicionCompleto;