// src/components/Productos.tsx
import React, { useState, useEffect } from 'react';
import { 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto,
  escucharProductos 
} from '../services/database';
import { Producto } from '../types/interfaces';

interface ProductosProps {
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

// Modal de confirmación temporal
interface ModalConfirmacionProps {
  mostrar: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'peligro' | 'advertencia' | 'info';
  cargando?: boolean;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  mostrar,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  cargando = false
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
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>{titulo}</h3>
        <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280' }}>{mensaje}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              padding: '0.5rem 1rem',
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
              padding: '0.5rem 1rem',
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

const Productos: React.FC<ProductosProps> = ({ mostrarNotificacion }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState<string>('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState<string>('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState<boolean>(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Cargar productos usando el listener en tiempo real
  useEffect(() => {
    setCargando(true);
    const unsubscribe = escucharProductos((productosActualizados: Producto[]) => {
      setProductos(productosActualizados);
      setCargando(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  const manejarCrearProducto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nuevoProducto.trim()) {
      mostrarNotificacion('El nombre del producto es requerido', 'error');
      return;
    }

    // Verificar si el producto ya existe
    const productoExistente = productos.find(p => 
      p.nombre.toLowerCase() === nuevoProducto.trim().toLowerCase()
    );
    
    if (productoExistente) {
      mostrarNotificacion('Ya existe un producto con ese nombre', 'error');
      return;
    }

    setGuardando(true);
    try {
      await crearProducto({ nombre: nuevoProducto.trim() });
      setNuevoProducto('');
      mostrarNotificacion('Producto creado exitosamente', 'success');
    } catch (error) {
      console.error('Error creando producto:', error);
      mostrarNotificacion('Error al crear el producto', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (producto: Producto) => {
    setEditandoId(producto.id || '');
    setNombreEditado(producto.nombre);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
  };

  const manejarActualizarProducto = async (id: string) => {
    if (!nombreEditado.trim()) {
      mostrarNotificacion('El nombre del producto es requerido', 'error');
      return;
    }

    // Verificar si el nuevo nombre ya existe (excluyendo el producto actual)
    const productoExistente = productos.find(p => 
      p.id !== id && p.nombre.toLowerCase() === nombreEditado.trim().toLowerCase()
    );
    
    if (productoExistente) {
      mostrarNotificacion('Ya existe un producto con ese nombre', 'error');
      return;
    }

    setGuardando(true);
    try {
      await actualizarProducto(id, { nombre: nombreEditado.trim() });
      setEditandoId(null);
      setNombreEditado('');
      mostrarNotificacion('Producto actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error actualizando producto:', error);
      mostrarNotificacion('Error al actualizar el producto', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (producto: Producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminar(true);
  };

  const manejarEliminarProducto = async () => {
    if (!productoAEliminar?.id) return;

    setGuardando(true);
    try {
      await eliminarProducto(productoAEliminar.id);
      mostrarNotificacion('Producto eliminado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      if (error.message && error.message.includes('siendo usado en solicitudes')) {
        mostrarNotificacion('No se puede eliminar el producto porque está siendo usado en solicitudes', 'error');
      } else {
        mostrarNotificacion('Error al eliminar el producto', 'error');
      }
    } finally {
      setGuardando(false);
      setMostrarModalEliminar(false);
      setProductoAEliminar(null);
    }
  };

  if (cargando) {
    return (
      <div className="productos-container">
        <div className="productos-header">
          <h2>Productos</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="productos-container">
        <div className="productos-header">
          <h2>Productos</h2>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h2>Gestión de Productos</h2>
        <div className="productos-stats">
          <div className="stat-card">
            <span className="stat-number">{productos.length}</span>
            <span className="stat-label">Total Productos</span>
          </div>
        </div>
      </div>

      {/* Formulario para crear nuevo producto */}
      <div className="nuevo-producto-form">
        <h3>Crear Nuevo Producto</h3>
        <form onSubmit={manejarCrearProducto}>
          <div className="form-group">
            <label htmlFor="nuevoProducto">Nombre del Producto</label>
            <input
              type="text"
              id="nuevoProducto"
              value={nuevoProducto}
              onChange={(e) => setNuevoProducto(e.target.value)}
              placeholder="Ingrese el nombre del producto"
              disabled={guardando}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={guardando || !nuevoProducto.trim()}
          >
            {guardando ? 'Guardando...' : 'Crear Producto'}
          </button>
        </form>
      </div>

      {/* Lista de productos */}
      <div className="productos-lista">
        <h3>Productos Registrados</h3>
        {productos.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos registrados</p>
            <span>Crea tu primer producto usando el formulario de arriba</span>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="producto-card">
                <div className="producto-info">
                  {editandoId === producto.id ? (
                    <div className="edicion-inline">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            manejarActualizarProducto(producto.id || '');
                          }
                          if (e.key === 'Escape') {
                            cancelarEdicion();
                          }
                        }}
                        autoFocus
                        disabled={guardando}
                      />
                      <div className="botones-edicion">
                        <button 
                          onClick={() => manejarActualizarProducto(producto.id || '')}
                          className="btn-success-small"
                          disabled={guardando || !nombreEditado.trim()}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </button>
                        <button 
                          onClick={cancelarEdicion}
                          className="btn-cancel-small"
                          disabled={guardando}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4>{producto.nombre}</h4>
                      <p className="fecha-creacion">
                        Creado: {producto.fechaCreacion?.toDate?.()?.toLocaleDateString('es-PY') || 'Fecha no disponible'}
                      </p>
                    </>
                  )}
                </div>
                
                {editandoId !== producto.id && (
                  <div className="producto-acciones">
                    <button 
                      onClick={() => iniciarEdicion(producto)}
                      className="btn-secondary-small"
                      disabled={guardando}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => confirmarEliminar(producto)}
                      className="btn-danger-small"
                      disabled={guardando}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                      </svg>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        mostrar={mostrarModalEliminar}
        titulo="Eliminar Producto"
        mensaje={`¿Estás seguro de que quieres eliminar el producto "${productoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={manejarEliminarProducto}
        onCancelar={() => {
          setMostrarModalEliminar(false);
          setProductoAEliminar(null);
        }}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipo="peligro"
        cargando={guardando}
      />

      <style>{`
        .productos-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .productos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .productos-header h2 {
          color: #1f2937;
          margin: 0;
        }

        .productos-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .nuevo-producto-form {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .nuevo-producto-form h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
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
          border-color: #2563eb;
        }

        .form-group input:disabled {
          background-color: #f9fafb;
          opacity: 0.6;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .productos-lista {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .productos-lista h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state p {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .producto-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .producto-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .producto-info h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .fecha-creacion {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .edicion-inline {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .edicion-inline input {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid #2563eb;
          border-radius: 4px;
          font-size: 1rem;
        }

        .botones-edicion {
          display: flex;
          gap: 0.25rem;
        }

        .producto-acciones {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn-secondary-small,
        .btn-danger-small,
        .btn-success-small,
        .btn-cancel-small {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-secondary-small {
          background: #6b7280;
          color: white;
        }

        .btn-secondary-small:hover:not(:disabled) {
          background: #4b5563;
        }

        .btn-danger-small {
          background: #dc2626;
          color: white;
        }

        .btn-danger-small:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn-success-small {
          background: #059669;
          color: white;
          padding: 0.25rem 0.5rem;
        }

        .btn-success-small:hover:not(:disabled) {
          background: #047857;
        }

        .btn-cancel-small {
          background: #6b7280;
          color: white;
          padding: 0.25rem 0.5rem;
        }

        .btn-cancel-small:hover:not(:disabled) {
          background: #4b5563;
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
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .productos-container {
            padding: 1rem;
          }

          .productos-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .productos-grid {
            grid-template-columns: 1fr;
          }

          .edicion-inline {
            flex-direction: column;
          }

          .botones-edicion {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Productos;