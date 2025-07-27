import React, { useState } from 'react';

const FormularioSolicitud = ({ onCerrar, onGuardar, cargando = false }) => {
  const [datos, setDatos] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    producto: '',
    monto: ''
  });

  const [errores, setErrores] = useState({});

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

  return (
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            📝 Nueva Solicitud de Factura
          </h3>
          <button
            onClick={onCerrar}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio}>
          {/* RUC */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              RUC *
            </label>
            <input
              type="text"
              placeholder="12345678-9"
              value={datos.ruc}
              onChange={(e) => manejarCambio('ruc', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errores.ruc ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            {errores.ruc && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
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
              placeholder="Nombre de la empresa"
              value={datos.razonSocial}
              onChange={(e) => manejarCambio('razonSocial', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errores.razonSocial ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            {errores.razonSocial && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
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
              placeholder="cliente@empresa.com"
              value={datos.email}
              onChange={(e) => manejarCambio('email', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errores.email ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            {errores.email && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                {errores.email}
              </p>
            )}
          </div>

          {/* Producto */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Producto *
            </label>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={datos.producto}
              onChange={(e) => manejarCambio('producto', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errores.producto ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            {errores.producto && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                {errores.producto}
              </p>
            )}
          </div>

          {/* Monto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Monto (Gs.) *
            </label>
            <input
              type="number"
              placeholder="150000"
              value={datos.monto}
              onChange={(e) => manejarCambio('monto', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errores.monto ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            {errores.monto && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                {errores.monto}
              </p>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: cargando ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: cargando ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: cargando ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {cargando ? '⏳ Guardando en Firebase...' : '💾 Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioSolicitud;