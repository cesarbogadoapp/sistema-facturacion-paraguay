import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Solicitudes from './components/Solicitudes';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import { ContenedorNotificaciones } from './components/Notificaciones';
import { useNotificaciones } from './hooks/useNotificaciones';

// Crear contexto para notificaciones con valor por defecto más específico
export const NotificacionesContext = React.createContext({
  notificaciones: [],
  agregarNotificacion: () => {},
  removerNotificacion: () => {},
  limpiarNotificaciones: () => {},
  exito: () => {},
  error: () => {},
  advertencia: () => {},
  info: () => {}
});

function App() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const notificaciones = useNotificaciones();

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'solicitudes':
        return <Solicitudes />;
      case 'clientes':
        return <Clientes />;
      case 'productos':
        return <Productos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NotificacionesContext.Provider value={notificaciones}>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Sidebar 
          seccionActiva={seccionActiva}
          onCambiarSeccion={setSeccionActiva}
        />
        {renderizarContenido()}
        
        <ContenedorNotificaciones
          notificaciones={notificaciones.notificaciones}
          onRemover={notificaciones.removerNotificacion}
        />
      </div>
    </NotificacionesContext.Provider>
  );
}

export default App;