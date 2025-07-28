import React, { useState, useEffect } from 'react';
import { obtenerSolicitudes, crearProducto, actualizarProducto, eliminarProducto } from '../services/database';
import { useNotificacionesContext } from '../hooks/useNotificaciones';
import ModalConfirmacion from './ModalConfirmacion';

// Iconos SVG
const IconoEditar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
  </svg>
);

const IconoEliminar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
  </svg>
);

const IconoBuscar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
  </svg>
);

const IconoCerrar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
  </svg>
);

const IconoGuardar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
  </svg>
);

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  
  // Estados para edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [nombreEditando, setNombreEditando] = useState('');
  
  // Estados para eliminación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  
  const notificaciones = useNotificacionesContext();

  useEffect(() => {
    cargarProductos();
  }, []);

const cargarProductos = async () => {
  try {
    setCargando(true);
    const solicitudes = await obtenerSolicitudes();
    
    // Extraer productos únicos - VERSIÓN SIMPLE
    const productosMap = new Map();
    
    solicitudes.forEach(solicitud => {
      if (solicitud.producto?.nombre) {
        const nombreProducto = solicitud.producto.nombre;
        
        if (!productosMap.has(nombreProducto)) {
          productosMap.set(nombreProducto, {
            id: solicitud.productoId,
            nombre: nombreProducto,
            totalSolicitudes: 0,
            totalFacturado: 0,
            montoTotal: 0,
            pendientes: 0,
            ultimaVenta: null
          });
        }
        
        const producto = productosMap.get(nombreProducto);
        producto.totalSolicitudes++;
        
        if (solicitud.estado === 'emitida') {
          producto.totalFacturado++;
          producto.montoTotal += solicitud.monto;
          if (!producto.ultimaVenta || solicitud.fechaEmision > producto.ultimaVenta) {
            producto.ultimaVenta = solicitud.fechaEmision;
          }
        } else if (solicitud.estado === 'pendiente') {
          producto.pendientes++;
        }
      }
    });
    
    const productosArray = Array.from(productosMap.values());
    productosArray.sort((a, b) => b.totalFacturado - a.totalFacturado);
    
    setProductos(productosArray);
  } catch (error) {
    console.error('Error cargando productos:', error);
    notificaciones.error('Error de Carga', 'No se pudieron cargar los productos');
  } finally {
    setCargando(false);
  }
};

  const manejarCrearProducto = async (e) => {
  e.preventDefault();
  
  if (!nuevoProducto.trim()) {
    notificaciones.error('Campo Requerido', 'El nombre del producto es obligatorio');
    return;
  }

  const existe = productos.some(p => 
    p.nombre.toLowerCase() === nuevoProducto.trim().toLowerCase()
  );
  
  if (existe) {
    notificaciones.error('Producto Duplicado', 'Ya existe un producto con ese nombre');
    return;
  }

  try {
    setGuardandoProducto(true);
    const productoId = await crearProducto(nuevoProducto.trim());
    
    // CORREGIDO: Agregar producto nuevo SIN uso
    setProductos(prev => [{
      id: productoId,
      nombre: nuevoProducto.trim(),
      totalSolicitudes: 0,
      totalFacturado: 0,
      montoTotal: 0,
      pendientes: 0,
      ultimaVenta: null,
      puedeEditar: true,    // NUEVO producto SÍ se puede editar
      puedeEliminar: true   // NUEVO producto SÍ se puede eliminar
    }, ...prev]);

    setNuevoProducto('');
    setMostrarFormulario(false);
    notificaciones.exito('Producto Creado', 'El producto se ha agregado correctamente');
  } catch (error) {
    console.error('Error creando producto:', error);
    notificaciones.error('Error al Crear', 'No se pudo crear el producto: ' + error.message);
  } finally {
    setGuardandoProducto(false);
  }
};

  const iniciarEdicion = (producto) => {
    setProductoEditando(producto.id);
    setNombreEditando(producto.nombre);
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setNombreEditando('');
  };

  const guardarEdicion = async (productoId) => {
    if (!nombreEditando.trim()) {
      notificaciones.error('Campo Requerido', 'El nombre del producto no puede estar vacío');
      return;
    }

    // Verificar si ya existe otro producto con ese nombre
    const existe = productos.some(p => 
      p.id !== productoId && p.nombre.toLowerCase() === nombreEditando.trim().toLowerCase()
    );
    
    if (existe) {
      notificaciones.error('Producto Duplicado', 'Ya existe otro producto con ese nombre');
      return;
    }

    try {
      await actualizarProducto(productoId, nombreEditando.trim());
      
      // Actualizar estado local
      setProductos(prev => prev.map(p => 
        p.id === productoId ? { ...p, nombre: nombreEditando.trim() } : p
      ));
      
      setProductoEditando(null);
      setNombreEditando('');
      notificaciones.exito('Producto Actualizado', 'El nombre del producto se ha modificado correctamente');
    } catch (error) {
      console.error('Error actualizando producto:', error);
      notificaciones.error('Error al Actualizar', 'No se pudo actualizar el producto: ' + error.message);
    }
  };

  const confirmarEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarConfirmacion(true);
  };

  const eliminarProductoConfirmado = async () => {
    if (!productoAEliminar) return;

    try {
      setEliminandoProducto(true);
      await eliminarProducto(productoAEliminar.id);
      
      // Actualizar estado local
      setProductos(prev => prev.filter(p => p.id !== productoAEliminar.id));
      
      setMostrarConfirmacion(false);
      setProductoAEliminar(null);
      notificaciones.exito('Producto Eliminado', 'El producto se ha eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      notificaciones.error('Error al Eliminar', error.message || 'No se pudo eliminar el producto');
    } finally {
      setEliminandoProducto(false);
    }
  };

  const formatearMonto = (monto) => {
    return parseFloat(monto).toLocaleString('es-PY');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin ventas';
    if (fecha.toLocaleDateString) {
      return fecha.toLocaleDateString('es-PY');
    }
    return new Date(fecha).toLocaleDateString('es-PY');
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    if (!busqueda) return true;
    return producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div style={{ padding: '2rem', marginLeft: '280px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: 0, fontSize: '2rem' }}>
            Gestión de Productos
          </h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Catálogo de productos y estadísticas de ventas
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Estadísticas generales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2563eb' }}>
            Total Productos
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            {productos.length}
          </p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>
            Más Vendido
          </h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            {productos.length > 0 ? productos[0].nombre : 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconoBuscar />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              flex: 1,
              marginLeft: '0.75rem',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Lista de productos */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando productos...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            {busqueda ? 'No se encontraron productos' : 'No hay productos registrados'}
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
            {busqueda 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los productos se registran automáticamente al crear solicitudes'
            }
          </p>
          {!busqueda && (
            <button
              onClick={() => setMostrarFormulario(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              + Crear Primer Producto
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {productosFiltrados.map((producto, index) => (
            <div key={producto.id || index} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              {/* Botones de acción */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                {productoEditando === producto.id ? (
                  <>
                    <button
                      onClick={() => guardarEdicion(producto.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <IconoGuardar />
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <IconoCerrar />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => iniciarEdicion(producto)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Editar producto"
                    >
                      <IconoEditar />
                    </button>
                    <button
                      onClick={() => confirmarEliminacion(producto)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Eliminar producto"
                    >
                      <IconoEliminar />
                    </button>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingRight: '4rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#059669',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>📦</span>
                </div>
                <div style={{ flex: 1 }}>
                  {productoEditando === producto.id ? (
                    <input
                      type="text"
                      value={nombreEditando}
                      onChange={(e) => setNombreEditando(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                      autoFocus
                    />
                  ) : (
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                      {producto.nombre}
                    </h3>
                  )}
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                    Última venta: {formatearFecha(producto.ultimaVenta)}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                    {producto.totalSolicitudes}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                    Total Solicitudes
                  </div>
                </div>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {producto.totalFacturado}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    Facturas Emitidas
                  </div>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Pendientes:</span>
                  <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{producto.pendientes}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total facturado:</span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>
                    Gs. {formatearMonto(producto.montoTotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de nuevo producto */}
      {mostrarFormulario && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
              Nuevo Producto
            </h3>
            
            <form onSubmit={manejarCrearProducto}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={nuevoProducto}
                  onChange={(e) => setNuevoProducto(e.target.value)}
                  placeholder="Ej: Camiseta deportiva, Auriculares..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNuevoProducto('');
                  }}
                  disabled={guardandoProducto}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: guardandoProducto ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoProducto || !nuevoProducto.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: guardandoProducto ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (guardandoProducto || !nuevoProducto.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {guardandoProducto ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        visible={mostrarConfirmacion}
        tipo="eliminar"
        titulo="Eliminar Producto"
        mensaje={`¿Está seguro de que desea eliminar el producto "${productoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        onConfirmar={eliminarProductoConfirmado}
        onCancelar={() => {
          setMostrarConfirmacion(false);
          setProductoAEliminar(null);
        }}
        cargando={eliminandoProducto}
      />
    </div>
  );
};

export default Productos;