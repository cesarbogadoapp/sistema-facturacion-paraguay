import React, { useState, useEffect } from 'react';
import { obtenerSolicitudes } from '../services/database';

const IconoCerrar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
  </svg>
);

const IconoSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
  </svg>
);

const FormularioSolicitud = ({ onCerrar, onGuardar, cargando = false }) => {
  const [datos, setDatos] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    producto: '',
    monto: ''
  });

  const [errores, setErrores] = useState({});
  const [productos, setProductos] = useState([]);
  const [mostrandoNuevoProducto, setMostrandoNuevoProducto] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const solicitudes = await obtenerSolicitudes();
      
      const productosUnicos = [];
      const nombresVistos = new Set();
      
      solicitudes.forEach(solicitud => {
        if (solicitud.producto?.nombre && !nombresVistos.has(solicitud.producto.nombre)) {
          nombresVistos.add(solicitud.producto.nombre);
          productosUnicos.push({
            id: solicitud.productoId,
            nombre: solicitud.producto.nombre
          });
        }
      });
      
      setProductos(productosUnicos);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarRUC = (ruc) => {
    const rucLimpio = ruc.replace(/[-\s]/g, '');
    return rucLimpio.length >= 7 && rucLimpio.length <= 8 && /^\d+$/.test(rucLimpio);
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datos.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es obligatorio';
    } else if (!validarRUC(datos.ruc)) {
      nuevosErrores.ruc = 'Formato de RUC inválido';
    }

    if (!datos.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria';
    }

    if (!datos.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!validarEmail(datos.email)) {
      nuevosErrores.email = 'Formato de email inválido';
    }

    if (!datos.producto.trim()) {
      nuevosErrores.producto = 'El producto es obligatorio';
    }

    if (!datos.monto.trim()) {
      nuevosErrores.monto = 'El monto es obligatorio';
    } else if (isNaN(datos.monto) || parseFloat(datos.monto) <= 0) {
      nuevosErrores.monto = 'El monto debe ser un número mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onGuardar(datos);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem 2rem 1.5rem 2rem',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: cargando ? 'not-allowed' : 'pointer',
              color: 'white'
            }}
          >
            <IconoCerrar />
          </button>
          
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
            Nueva Solicitud de Factura
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            Complete los datos del cliente y producto
          </p>
        </div>

        {/* Formulario */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit}>
            {/* RUC */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={datos.ruc}
                onChange={handleInputChange}
                placeholder="12345678-9"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errores.ruc ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              {errores.ruc && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>
                  {errores.ruc}
                </p>
              )}
            </div>

            {/* Razón Social */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Razón Social *
              </label>
              <input
                type="text"
                name="razonSocial"
                value={datos.razonSocial}
                onChange={handleInputChange}
                placeholder="Nombre de la empresa"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errores.razonSocial ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              {errores.razonSocial && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>
                  {errores.razonSocial}
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={datos.email}
                onChange={handleInputChange}
                placeholder="cliente@empresa.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errores.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              {errores.email && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>
                  {errores.email}
                </p>
              )}
            </div>

            {/* Producto */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Producto *
              </label>
              
              {mostrandoNuevoProducto ? (
                <div>
                  <input
                    type="text"
                    name="producto"
                    value={datos.producto}
                    onChange={handleInputChange}
                    placeholder="Nombre del nuevo producto"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errores.producto ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMostrandoNuevoProducto(false);
                      setDatos(prev => ({ ...prev, producto: '' }));
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ← Volver a lista
                  </button>
                </div>
              ) : (
                <select
                  name="producto"
                  value={datos.producto}
                  onChange={(e) => {
                    if (e.target.value === '__nuevo__') {
                      setMostrandoNuevoProducto(true);
                      setDatos(prev => ({ ...prev, producto: '' }));
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errores.producto ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">
                    {cargandoProductos ? 'Cargando...' : 'Seleccionar producto'}
                  </option>
                  {productos.map(producto => (
                    <option key={producto.nombre} value={producto.nombre}>
                      {producto.nombre}
                    </option>
                  ))}
                  <option value="__nuevo__">+ Agregar nuevo producto</option>
                </select>
              )}

              {errores.producto && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>
                  {errores.producto}
                </p>
              )}
            </div>

            {/* Monto */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Monto (Gs.) *
              </label>
              <input
                type="number"
                name="monto"
                value={datos.monto}
                onChange={handleInputChange}
                placeholder="150000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errores.monto ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              {errores.monto && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>
                  {errores.monto}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem 2rem 2rem',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={cargando}
            style={{
              padding: '0.75rem 1.5rem',
              background: cargando ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {cargando && <IconoSpinner />}
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FormularioSolicitud;