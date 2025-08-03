// src/components/FormularioSolicitudMejorado.tsx - CON MÚLTIPLES PRODUCTOS
import React, { useState, useEffect } from 'react';
import { crearSolicitud, obtenerClientes, obtenerProductos } from '../services/database';
import { validarRUC, formatearMonto } from '../utils';
import { Cliente, Producto } from '../types/interfaces';

interface FormularioSolicitudMejoradoProps {
  mostrar: boolean;
  onCerrar: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
  onSolicitudCreada?: () => void;
}

interface ProductoSolicitud {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface DatosFormulario {
  ruc: string;
  razonSocial: string;
  email: string;
  productos: ProductoSolicitud[];
  numeroGuia: string;
}

const FormularioSolicitudMejorado: React.FC<FormularioSolicitudMejoradoProps> = ({ 
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
    productos: [{ productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }],
    numeroGuia: ''
  });

  const [errores, setErrores] = useState<any>({});
  const [cargando, setCargando] = useState<boolean>(false);
  const [cargandoData, setCargandoData] = useState<boolean>(true);

  // Estados para datos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState<boolean>(false);
  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);

  // ESTADO ADICIONAL PARA FORZAR RE-RENDER EN CHROME
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // FUNCIÓN HELPER PARA DETECTAR CHROME
  const isChrome = () => {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  };

  // FUNCIÓN PARA FORZAR UPDATE EN CHROME
  const triggerForceUpdate = () => {
    if (isChrome()) {
      setForceUpdate(prev => prev + 1);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (mostrar) {
      cargarDatosIniciales();
    }
  }, [mostrar]);

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

  // Limpiar formulario
  const limpiarFormulario = (): void => {
    setDatosFormulario({
      ruc: '',
      razonSocial: '',
      email: '',
      productos: [{ productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }],
      numeroGuia: ''
    });
    setErrores({});
    setClientesSugeridos([]);
    setMostrandoSugerencias(false);
    setMostrarGuia(false);
  };

  // Agregar producto
  const agregarProducto = () => {
    setDatosFormulario(prev => ({
      ...prev,
      productos: [...prev.productos, { productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    }));
  };

  // Eliminar producto
  const eliminarProducto = (index: number) => {
    if (datosFormulario.productos.length > 1) {
      setDatosFormulario(prev => ({
        ...prev,
        productos: prev.productos.filter((_, i) => i !== index)
      }));
    }
  };

  // Actualizar producto - SOLUCIÓN AGRESIVA PARA CHROME
  const actualizarProducto = (index: number, campo: keyof ProductoSolicitud, valor: any) => {
    console.log('🔧 Actualizando producto Chrome-safe:', { index, campo, valor });
    
    // MÉTODO 1: Actualización inmediata
    setDatosFormulario(prev => {
      const nuevosProductos = JSON.parse(JSON.stringify(prev.productos)); // Deep clone
      nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
      
      // Si cambia el producto, limpiar precio y subtotal
      if (campo === 'productoId') {
        const producto = productos.find(p => p.id === valor);
        if (producto) {
          nuevosProductos[index].nombre = producto.nombre;
          nuevosProductos[index].precioUnitario = 0;
          nuevosProductos[index].subtotal = 0;
        }
      }
      
      // CALCULAR SUBTOTAL INMEDIATAMENTE
      const cantidad = parseInt(String(nuevosProductos[index].cantidad)) || 0;
      const precio = parseInt(String(nuevosProductos[index].precioUnitario)) || 0;
      nuevosProductos[index].subtotal = cantidad * precio;
      
      console.log('📊 Producto actualizado inmediatamente:', nuevosProductos[index]);
      return { ...prev, productos: nuevosProductos };
    });
    
    // MÉTODO 2: Forzar actualización con requestAnimationFrame (Chrome específico)
    if (isChrome()) {
      requestAnimationFrame(() => {
        setDatosFormulario(current => {
          const productosActualizados = [...current.productos];
          const cantidad = parseInt(String(productosActualizados[index].cantidad)) || 0;
          const precio = parseInt(String(productosActualizados[index].precioUnitario)) || 0;
          productosActualizados[index].subtotal = cantidad * precio;
          
          console.log('🎯 Chrome requestAnimationFrame update:', productosActualizados[index]);
          triggerForceUpdate();
          return { ...current, productos: productosActualizados };
        });
      });
    }
    
    // MÉTODO 3: Timeout como fallback final
    setTimeout(() => {
      setDatosFormulario(current => {
        const productosFinales = [...current.productos];
        const cantidad = parseInt(String(productosFinales[index].cantidad)) || 0;
        const precio = parseInt(String(productosFinales[index].precioUnitario)) || 0;
        productosFinales[index].subtotal = cantidad * precio;
        
        console.log('⏰ Timeout fallback update:', productosFinales[index]);
        return { ...current, productos: productosFinales };
      });
    }, 100);
  };

  // Calcular total - CORREGIDO PARA CHROME
  const calcularTotal = (): number => {
    const total = datosFormulario.productos.reduce((total, prod) => {
      const subtotal = Number(prod.subtotal) || 0;
      console.log('🔢 Producto en total:', prod.nombre, 'Subtotal:', subtotal);
      return total + subtotal;
    }, 0);
    
    console.log('💰 Total final:', total);
    return Number(total) || 0;
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
    setDatosFormulario(prev => ({
      ...prev,
      ruc: clienteSeleccionado.ruc,
      razonSocial: clienteSeleccionado.razonSocial,
      email: clienteSeleccionado.email
    }));
    setMostrandoSugerencias(false);
    setClientesSugeridos([]);
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: any = {};

    // Validar cliente
    if (!datosFormulario.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es obligatorio';
    } else if (!validarRUC(datosFormulario.ruc)) {
      nuevosErrores.ruc = 'El formato del RUC no es válido';
    }

    if (!datosFormulario.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria';
    }

    if (!datosFormulario.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    }

    // Validar productos
    const productosValidos = datosFormulario.productos.filter(p => p.productoId && p.cantidad > 0 && p.precioUnitario > 0);
    if (productosValidos.length === 0) {
      nuevosErrores.productos = 'Debe agregar al menos un producto válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  const procesarEnvioFormulario = async (evento: React.FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();

    console.log('📝 Datos del formulario:', datosFormulario);
    console.log('💰 Total calculado:', calcularTotal());
    
    if (!validarFormulario()) {
      mostrarNotificacion('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    setCargando(true);
    try {
      const datosCliente = clientes.find(c => c.ruc === datosFormulario.ruc) || {
        ruc: datosFormulario.ruc,
        razonSocial: datosFormulario.razonSocial,
        email: datosFormulario.email
      };

      // Preparar productos válidos
      const productosValidos = datosFormulario.productos.filter(p => p.productoId && p.cantidad > 0 && p.precioUnitario > 0);
      console.log('✅ Productos válidos:', productosValidos);
      
      // Para compatibilidad, usar el primer producto en los campos legacy
      const primerProducto = productosValidos[0];
      const producto = productos.find(p => p.id === primerProducto.productoId);

      const datosSolicitud = {
        clienteId: datosCliente.id || null,
        productoId: primerProducto.productoId, // Legacy
        monto: calcularTotal(),
        productos: productosValidos, // Nuevo formato
        numeroGuia: datosFormulario.numeroGuia.trim() || undefined,
        cliente: {
          ruc: datosFormulario.ruc,
          razonSocial: datosFormulario.razonSocial,
          email: datosFormulario.email
        },
        producto: {
          nombre: producto?.nombre || primerProducto.nombre
        }
      };
      console.log('📤 Datos a enviar:', datosSolicitud);
      await crearSolicitud(datosSolicitud);
      
      mostrarNotificacion('Solicitud creada correctamente', 'success');
      limpiarFormulario();
      onCerrar();
      
      if (onSolicitudCreada) {
        onSolicitudCreada();
      }
    } catch (error) {
      console.error('❌ Error detallado:', error);
      mostrarNotificacion('Error al crear la solicitud', 'error');
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="overlay-modal" onClick={() => !cargando && onCerrar()}>
      <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="encabezado-modal">
          <h2>Nueva Solicitud de Facturación</h2>
          <button 
            className="boton-cerrar" 
            onClick={onCerrar}
            disabled={cargando}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {cargandoData ? (
          <div className="contenedor-carga">
            <div className="spinner-carga"></div>
            <p>Cargando información...</p>
          </div>
        ) : (
          <form onSubmit={procesarEnvioFormulario} className="formulario-principal">
            
            {/* Datos del Cliente */}
            <div className="seccion-datos">
              <h3 className="titulo-seccion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Información del Cliente
              </h3>
              
              {/* RUC */}
              <div className="grupo-campo">
                <label htmlFor="campo-ruc" className="etiqueta-campo">RUC</label>
                <input
                  type="text"
                  id="campo-ruc"
                  value={datosFormulario.ruc}
                  onChange={(e) => {
                    setDatosFormulario(prev => ({ ...prev, ruc: e.target.value }));
                    buscarClientesCoincidentes('ruc', e.target.value);
                  }}
                  placeholder="Ej: 12345678-9"
                  disabled={cargando}
                  className={`campo-entrada ${errores.ruc ? 'campo-error' : ''}`}
                />
                {errores.ruc && <span className="mensaje-error">{errores.ruc}</span>}
                
                {/* Sugerencias */}
                {mostrandoSugerencias && (
                  <div className="lista-sugerencias">
                    {clientesSugeridos.map((cliente) => (
                      <div 
                        key={cliente.id}
                        className="item-sugerencia"
                        onClick={() => seleccionarClienteSugerido(cliente)}
                      >
                        <div>
                          <span className="ruc-sugerido">{cliente.ruc}</span>
                          <span className="nombre-sugerido">{cliente.razonSocial}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Razón Social */}
              <div className="grupo-campo">
                <label htmlFor="campo-razon-social" className="etiqueta-campo">Razón Social</label>
                <input
                  type="text"
                  id="campo-razon-social"
                  value={datosFormulario.razonSocial}
                  onChange={(e) => setDatosFormulario(prev => ({ ...prev, razonSocial: e.target.value }))}
                  placeholder="Ej: Mi Empresa SRL"
                  disabled={cargando}
                  className={`campo-entrada ${errores.razonSocial ? 'campo-error' : ''}`}
                />
                {errores.razonSocial && <span className="mensaje-error">{errores.razonSocial}</span>}
              </div>

              {/* Email */}
              <div className="grupo-campo">
                <label htmlFor="campo-email" className="etiqueta-campo">Email</label>
                <input
                  type="email"
                  id="campo-email"
                  value={datosFormulario.email}
                  onChange={(e) => setDatosFormulario(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: contacto@miempresa.com"
                  disabled={cargando}
                  className={`campo-entrada ${errores.email ? 'campo-error' : ''}`}
                />
                {errores.email && <span className="mensaje-error">{errores.email}</span>}
              </div>
            </div>

            {/* Productos */}
            <div className="seccion-datos">
              <div className="header-productos">
                <h3 className="titulo-seccion">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Productos ({datosFormulario.productos.length})
                </h3>
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="btn-agregar-producto"
                  disabled={cargando}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Agregar Producto
                </button>
              </div>

              {datosFormulario.productos.map((producto, index) => (
                <div key={index} className="producto-item">
                  <div className="producto-header">
                    <span className="producto-numero">#{index + 1}</span>
                    {datosFormulario.productos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarProducto(index)}
                        className="btn-eliminar-producto"
                        disabled={cargando}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="producto-campos">
                    {/* Producto */}
                    <div className="grupo-campo">
                      <label className="etiqueta-campo">Producto</label>
                      <select
                        value={producto.productoId}
                        onChange={(e) => actualizarProducto(index, 'productoId', e.target.value)}
                        disabled={cargando}
                        className="campo-entrada"
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad - SOLUCIÓN CHROME */}
                    <div className="grupo-campo">
                      <label className="etiqueta-campo">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={producto.cantidad}
                        onChange={(e) => {
                          const nuevaCantidad = parseInt(e.target.value) || 1;
                          console.log('📦 Cantidad cambiada:', nuevaCantidad);
                          
                          // Actualizar cantidad
                          actualizarProducto(index, 'cantidad', nuevaCantidad);
                          
                          // CHROME FIX: Recalcular subtotal inmediatamente
                          setTimeout(() => {
                            const precioActual = parseInt(String(producto.precioUnitario)) || 0;
                            const nuevoSubtotal = nuevaCantidad * precioActual;
                            console.log('💰 Recálculo cantidad Chrome:', { nuevaCantidad, precioActual, nuevoSubtotal });
                            
                            setDatosFormulario(prev => {
                              const productosUpdate = [...prev.productos];
                              productosUpdate[index].cantidad = nuevaCantidad;
                              productosUpdate[index].subtotal = nuevoSubtotal;
                              return { ...prev, productos: productosUpdate };
                            });
                            
                            triggerForceUpdate();
                          }, 10);
                        }}
                        onBlur={(e) => {
                          // ÚLTIMO RECURSO: Forzar recálculo en blur
                          const cantidad = parseInt(e.target.value) || 1;
                          const precio = parseInt(String(producto.precioUnitario)) || 0;
                          const subtotal = cantidad * precio;
                          
                          console.log('🎯 Blur recálculo final:', { cantidad, precio, subtotal });
                          
                          setDatosFormulario(prev => {
                            const productos = [...prev.productos];
                            productos[index] = {
                              ...productos[index],
                              cantidad: cantidad,
                              subtotal: subtotal
                            };
                            return { ...prev, productos };
                          });
                        }}
                        disabled={cargando}
                        className="campo-entrada"
                      />
                    </div>

                    {/* Precio Unitario - SOLUCIÓN CHROME */}
                    <div className="grupo-campo">
                      <label className="etiqueta-campo">Precio Unitario (Gs.)</label>
                      <input
                        type="text"
                        value={producto.precioUnitario ? formatearMonto(producto.precioUnitario.toString()) : ''}
                        onChange={(e) => {
                          const numeroLimpio = e.target.value.replace(/[^\d]/g, '');
                          const nuevoPrecio = parseInt(numeroLimpio) || 0;
                          console.log('💵 Precio cambiado:', nuevoPrecio);
                          
                          // Actualizar precio
                          actualizarProducto(index, 'precioUnitario', nuevoPrecio);
                          
                          // CHROME FIX: Recalcular subtotal inmediatamente
                          setTimeout(() => {
                            const cantidadActual = parseInt(String(producto.cantidad)) || 1;
                            const nuevoSubtotal = cantidadActual * nuevoPrecio;
                            console.log('💰 Recálculo precio Chrome:', { cantidadActual, nuevoPrecio, nuevoSubtotal });
                            
                            setDatosFormulario(prev => {
                              const productosUpdate = [...prev.productos];
                              productosUpdate[index].precioUnitario = nuevoPrecio;
                              productosUpdate[index].subtotal = nuevoSubtotal;
                              return { ...prev, productos: productosUpdate };
                            });
                            
                            triggerForceUpdate();
                          }, 10);
                        }}
                        onBlur={(e) => {
                          // ÚLTIMO RECURSO: Forzar recálculo en blur
                          const numeroLimpio = e.target.value.replace(/[^\d]/g, '');
                          const precio = parseInt(numeroLimpio) || 0;
                          const cantidad = parseInt(String(producto.cantidad)) || 1;
                          const subtotal = cantidad * precio;
                          
                          console.log('🎯 Blur precio final:', { precio, cantidad, subtotal });
                          
                          setDatosFormulario(prev => {
                            const productos = [...prev.productos];
                            productos[index] = {
                              ...productos[index],
                              precioUnitario: precio,
                              subtotal: subtotal
                            };
                            return { ...prev, productos };
                          });
                        }}
                        placeholder="Ej: 50000"
                        disabled={cargando}
                        className="campo-entrada"
                      />
                    </div>

                    {/* Subtotal - LIMPIO SIN DEBUG */}
                    <div className="grupo-campo">
                      <label className="etiqueta-campo">Subtotal</label>
                      <div className="subtotal-display" key={`subtotal-${index}-${forceUpdate}`}>
                        Gs. {formatearMonto((producto.subtotal || 0).toString())}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {errores.productos && <span className="mensaje-error">{errores.productos}</span>}

              {/* Total General - LIMPIO SIN DEBUG */}
              <div className="total-general" key={`total-${forceUpdate}`}>
                <strong>Total: Gs. {formatearMonto(calcularTotal().toString())}</strong>
              </div>
            </div>

            {/* Número de Guía */}
            <div className="seccion-datos">
              <div className="header-guia">
                <button
                  type="button"
                  onClick={() => setMostrarGuia(!mostrarGuia)}
                  className="btn-toggle-guia"
                  disabled={cargando}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <path d="M16 8l2 0 0 8-8 0"/>
                    <path d="M21 11.5l-5 5"/>
                  </svg>
                  {mostrarGuia ? 'Ocultar' : 'Agregar'} Número de Guía Logística
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
                <div className="grupo-campo">
                  <label htmlFor="campo-guia" className="etiqueta-campo">
                    Número de Guía (Opcional)
                  </label>
                  <input
                    type="text"
                    id="campo-guia"
                    value={datosFormulario.numeroGuia}
                    onChange={(e) => setDatosFormulario(prev => ({ ...prev, numeroGuia: e.target.value }))}
                    placeholder="Ej: GU123456789"
                    disabled={cargando}
                    className="campo-entrada"
                  />
                  <small className="texto-ayuda">
                    Ingrese el número de seguimiento de la empresa logística
                  </small>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="contenedor-botones">
              <button 
                type="button"
                onClick={onCerrar}
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
          .header-productos {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .btn-agregar-producto {
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

          .btn-agregar-producto:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }

          .producto-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: #fafafa;
          }

          .producto-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .producto-numero {
            font-weight: 600;
            color: #374151;
            background: #e5e7eb;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
          }

          .btn-eliminar-producto {
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

          .btn-eliminar-producto:hover:not(:disabled) {
            background: #dc2626;
            transform: scale(1.1);
          }

          .producto-campos {
            display: grid;
            grid-template-columns: 2fr 1fr 1.5fr 1.5fr;
            gap: 1rem;
          }

          .subtotal-display {
            padding: 0.75rem;
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-weight: 600;
            color: #059669;
          }

          .total-general {
            text-align: right;
            padding: 1rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 8px;
            font-size: 1.125rem;
            margin-top: 1rem;
          }

          .header-guia {
            margin-bottom: 1rem;
          }

          .btn-toggle-guia {
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

          .btn-toggle-guia:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
          }

          .texto-ayuda {
            color: #6b7280;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
          }

          @media (max-width: 768px) {
            .producto-campos {
              grid-template-columns: 1fr;
            }

            .header-productos {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }
          }

          /* Reutilizar estilos existentes del FormularioSolicitud original */
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
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            margin: auto;
            position: relative;
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

          .ruc-sugerido {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.875rem;
            display: block;
          }

          .nombre-sugerido {
            color: #6b7280;
            font-size: 0.875rem;
            display: block;
            margin-top: 0.25rem;
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

export default FormularioSolicitudMejorado;