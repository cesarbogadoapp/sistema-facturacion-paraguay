import React, { useState, useEffect } from 'react';
import { obtenerSolicitudes, crearProducto } from '../services/database';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [guardandoProducto, setGuardandoProducto] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const solicitudes = await obtenerSolicitudes();
      
      // Extraer productos únicos de las solicitudes y calcular estadísticas
      const productosMap = new Map();
      
      solicitudes.forEach(solicitud => {
        if (solicitud.producto && solicitud.producto.nombre) {
          const nombreProducto = solicitud.producto.nombre;
          
          if (!productosMap.has(nombreProducto)) {
            productosMap.set(nombreProducto, {
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
      
      // Convertir a array y ordenar por total facturado
      const productosArray = Array.from(productosMap.values());
      productosArray.sort((a, b) => b.totalFacturado - a.totalFacturado);
      
      setProductos(productosArray);
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('Error al cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const manejarCrearProducto = async (e) => {
    e.preventDefault();
    
    if (!nuevoProducto.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    // Verificar si ya existe
    const existe = productos.some(p => 
      p.nombre.toLowerCase() === nuevoProducto.trim().toLowerCase()
    );
    
    if (existe) {
      alert('Ya existe un producto con ese nombre');
      return;
    }

    try {
      setGuardandoProducto(true);
      await crearProducto(nuevoProducto.trim());
      
      // Agregar al estado local
      setProductos(prev => [{
        nombre: nuevoProducto.trim(),
        totalSolicitudes: 0,
        totalFacturado: 0,
        montoTotal: 0,
        pendientes: 0,
        ultimaVenta: null
      }, ...prev]);

      setNuevoProducto('');
      setMostrarFormulario(false);
      alert('✅ Producto creado exitosamente');
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('❌ Error al crear el producto: ' + error.message);
    } finally {
      setGuardandoProducto(false);
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
            📦 Gestión de Productos
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
            fontWeight: 'bold'
          }}
        >
          ➕ Nuevo Producto
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
            📦 Total Productos
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
            🏆 Más Vendido
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
          <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              flex: 1,
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
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
              ➕ Crear Primer Producto
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
            <div key={producto.nombre || index} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
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
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                    {producto.nombre}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                    📅 Última venta: {formatearFecha(producto.ultimaVenta)}
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
              📦 Nuevo Producto
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
                 {guardandoProducto ? '⏳ Guardando...' : '💾 Guardar'}
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 );
};

export default Productos;