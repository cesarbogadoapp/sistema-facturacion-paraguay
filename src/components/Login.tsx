// src/components/Login.tsx - CON DESCARGA CSV
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { obtenerSolicitudes, obtenerClientes, obtenerProductos } from '../services/database';
import { formatearMontoConSimbolo, formatearFechaHora } from '../utils';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [descargandoCSV, setDescargandoCSV] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setError(
        isLogin 
          ? 'Error al iniciar sesión. Verifica tus credenciales.' 
          : 'Error al crear cuenta. El email puede estar en uso.'
      );
    } finally {
      setCargando(false);
    }
  };

  const descargarCSV = async () => {
    setDescargandoCSV(true);
    try {
      // Obtener todos los datos
      const [solicitudes, clientes, productos] = await Promise.all([
        obtenerSolicitudes(),
        obtenerClientes(),
        obtenerProductos()
      ]);

      // Crear CSV content
      let csvContent = 'ID,Cliente,RUC,Email,Producto,Monto,Estado,Fecha Solicitud,Fecha Emision\n';
      
      solicitudes.forEach(solicitud => {
        const cliente = clientes.find(c => c.ruc === solicitud.cliente.ruc);
        const producto = productos.find(p => p.id === solicitud.productoId);
        
        csvContent += `"${solicitud.id || ''}",`;
        csvContent += `"${solicitud.cliente.razonSocial}",`;
        csvContent += `"${solicitud.cliente.ruc}",`;
        csvContent += `"${solicitud.cliente.email}",`;
        csvContent += `"${solicitud.producto.nombre}",`;
        csvContent += `"${formatearMontoConSimbolo(solicitud.monto)}",`;
        csvContent += `"${solicitud.estado}",`;
        csvContent += `"${formatearFechaHora(solicitud.fechaSolicitud)}",`;
        csvContent += `"${solicitud.fechaEmision ? formatearFechaHora(solicitud.fechaEmision) : 'N/A'}"\n`;
      });

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `solicitudes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error descargando CSV:', error);
      alert('Error al descargar el archivo CSV');
    } finally {
      setDescargandoCSV(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>
      
      <div className="login-content">
        {/* Header con descarga CSV */}
        <div className="login-header">
          <div className="header-brand">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h1>Sistema de Facturación</h1>
              <p>Paraguay - Gestión Empresarial</p>
            </div>
          </div>
          
          {/*<button
            onClick={descargarCSV}
            disabled={descargandoCSV}
            className="btn-download-csv"
            title="Descargar datos en formato CSV"
          >
            {descargandoCSV ? (
              <>
                <div className="spinner-download"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Descargar CSV</span>
              </>
            )}
          </button>*/}
        </div>

        {/* Formulario de login */}
        <div className="login-form-container">
          <div className="form-header">
            <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            <p>
              {isLogin 
                ? 'Accede a tu sistema de facturación' 
                : 'Crea tu cuenta para comenzar'
              }
            </p>
          </div>

          <form onSubmit={manejarSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={cargando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                disabled={cargando}
                minLength={6}
              />
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="spinner"></div>
                  <span>{isLogin ? 'Iniciando...' : 'Creando...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
              )}
            </button>
          </form>

          <div className="form-footer">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="btn-toggle"
              disabled={cargando}
            >
              {isLogin 
                ? '¿No tienes cuenta? Crear una' 
                : '¿Ya tienes cuenta? Iniciar sesión'
              }
            </button>
          </div>
        </div>

        {/* Info de prueba 
        <div className="demo-info">
          <h3>Credenciales de prueba:</h3>
          <p><strong>Email:</strong> demo@empresa.com</p>
          <p><strong>Contraseña:</strong> 123456</p>
        </div>*/}
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
        }

        .background-pattern {
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        }

        .login-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .login-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          color: white;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .header-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header-brand p {
          margin: 0.25rem 0 0 0;
          opacity: 0.8;
          font-size: 0.875rem;
        }

        .btn-download-csv {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .btn-download-csv:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .btn-download-csv:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-download {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .login-form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .form-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .form-header p {
          margin: 0;
          opacity: 0.8;
        }

        .login-form {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: white;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
        }

        .btn-toggle {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .btn-toggle:hover:not(:disabled) {
          color: white;
        }

        .btn-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .demo-info {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin: 0 2rem 2rem 2rem;
          color: white;
          text-align: center;
        }

        .demo-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .demo-info p {
          margin: 0.25rem 0;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .login-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .login-form {
            margin: 0 1rem;
            padding: 1.5rem;
          }

          .demo-info {
            margin: 0 1rem 1rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;