import React, { useState, useEffect } from 'react';
import { obtenerSolicitudes } from '../services/database';

// Iconos SVG profesionales
const IconoCerrar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
  </svg>
);

const IconoUsuario = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
  </svg>
);

const IconoEmpresa = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z"/>
  </svg>
);

const IconoEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
  </svg>
);

const IconoProducto = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
  </svg>
);

const IconoDinero = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
  </svg>
);

const IconoSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
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
  const [campoEnfocado, setCampoEnfocado] = useState('');
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
      
      // Extraer productos únicos
      const productosUnicos = [];
      const nombresVistos = new Set();
      
      solicitudes.forEach(solicitud => {
        if (solicitud.producto && solicitud.producto.nombre && !nombresVistos.has(solicitud.producto.nombre)) {
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

  const manejarCambio = (campo, valor) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  const validarRUC = (ruc) => {
    // Validación básica del RUC paraguayo
    const rucLimpio = ruc.replace(/[-\s]/g, '');
    if (rucLimpio.length < 7 || rucLimpio.length > 8) {
      return false;
    }
    return /^\d+$/.test(rucLimpio);
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

  const manejarEnvio = (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      onGuardar(datos);
    }
  };

  const CampoFormulario = ({ 
    icono: Icono, 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    error, 
    value,
    required = false
  }) => {
    const tieneError = !!error;
    const estaEnfocado = campoEnfocado === name;
    
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '600',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: tieneError ? '#ef4444' : estaEnfocado ? '#3b82f6' : '#9ca3af',
            transition: 'color 0.2s ease',
            zIndex: 1
          }}>
            <Icono />
          </div>
          
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => manejarCambio(name, e.target.value)}
            onFocus={() => setCampoEnfocado(name)}
            onBlur={() => setCampoEnfocado('')}
            placeholder={placeholder}
            style={{
              width: '100%',
              paddingLeft: '44px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              border: `2px solid ${tieneError ? '#ef4444' : estaEnfocado ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              backgroundColor: estaEnfocado ? '#f8fafc' : 'white'
            }}
          />
        </div>
        
        {error && (
          <div style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            color: '#ef4444',
            fontSize: '0.8rem'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.25rem' }}>
              <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
            </svg>
            {error}
          </div>
        )}
      </div>
    );
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
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s ease-out'
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
              transition: 'background-color 0.2s ease',
              color: 'white'
            }}
            onMouseOver={(e) => {
              if (!cargando) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!cargando) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }
            }}
          >
            <IconoCerrar />
          </button>
          
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Nueva Solicitud de Factura
          </h3>
          <p style={{ 
            margin: 0, 
            opacity: 0.9,
            fontSize: '0.95rem'
          }}>
            Complete los datos del cliente y producto
          </p>
        </div>

        {/* Formulario */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
          <form onSubmit={manejarEnvio}>
            <CampoFormulario
              icono={IconoEmpresa}
              label="RUC"
              name="ruc"
              placeholder="12345678-9"
              value={datos.ruc}
              error={errores.ruc}
              required
            />

            <CampoFormulario
              icono={IconoUsuario}
              label="Razón Social"
              name="razonSocial"
              placeholder="Nombre de la empresa"
              value={datos.razonSocial}
              error={errores.razonSocial}
              required
            />

            <CampoFormulario
              icono={IconoEmail}
              label="Email"
              name="email"
              type="email"
              placeholder="cliente@empresa.com"
              value={datos.email}
              error={errores.email}
              required
            />

            {/* Campo Producto con Dropdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Producto <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errores.producto ? '#ef4444' : campoEnfocado === 'producto' ? '#3b82f6' : '#9ca3af',
                  transition: 'color 0.2s ease',
                  zIndex: 1
                }}>
                  <IconoProducto />
                </div>
                
                {mostrandoNuevoProducto ? (
                  <div>
                    <input
                      type="text"
                      value={datos.producto}
                      onChange={(e) => manejarCambio('producto', e.target.value)}
                      onFocus={() => setCampoEnfocado('producto')}
                      onBlur={() => setCampoEnfocado('')}
                      placeholder="Nombre del nuevo producto"
                      style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: '12px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        border: `2px solid ${errores.producto ? '#ef4444' : campoEnfocado === 'producto' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: campoEnfocado === 'producto' ? '#f8fafc' : 'white'
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
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ← Volver a lista de productos
                    </button>
                  </div>
                ) : (
                  <div>
                    <select
                      value={datos.producto}
                      onChange={(e) => {
                        if (e.target.value === '__nuevo__') {
                          setMostrandoNuevoProducto(true);
                          setDatos(prev => ({ ...prev, producto: '' }));
                        } else {
                          manejarCambio('producto', e.target.value);
                        }
                      }}
                      onFocus={() => setCampoEnfocado('producto')}
                      onBlur={() => setCampoEnfocado('')}
                      style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: '12px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        border: `2px solid ${errores.producto ? '#ef4444' : campoEnfocado === 'producto' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: campoEnfocado === 'producto' ? '#f8fafc' : 'white',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="">
                        {cargandoProductos ? 'Cargando productos...' : 'Seleccionar producto'}
                      </option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.nombre}>
                          {producto.nombre}
                        </option>
                      ))}
                      <option value="__nuevo__" style={{ borderTop: '1px solid #e5e7eb' }}>
                        + Agregar nuevo producto
                      </option>
                    </select>
                    
                    {productos.length > 0 && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                        {productos.length} productos disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {errores.producto && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#ef4444',
                  fontSize: '0.8rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.25rem' }}>
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                  </svg>
                  {errores.producto}
                </div>
              )}
            </div>

            <CampoFormulario
              icono={IconoDinero}
              label="Monto (Gs.)"
              name="monto"
              type="number"
              placeholder="150000"
              value={datos.monto}
              error={errores.monto}
              required
            />
          </form>
        </div>

        {/* Footer con botones */}
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
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: cargando ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!cargando) {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseOut={(e) => {
              if (!cargando) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={manejarEnvio}
            disabled={cargando}
            style={{
              padding: '0.75rem 1.5rem',
              background: cargando 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!cargando) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!cargando) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {cargando && <IconoSpinner />}
            {cargando ? 'Guardando...' : 'Guardar Solicitud'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FormularioSolicitud;