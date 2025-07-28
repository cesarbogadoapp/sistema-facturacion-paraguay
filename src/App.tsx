import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Solicitudes from './components/Solicitudes';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import { ContenedorNotificaciones } from './components/Notificaciones';
import { useNotificaciones } from './hooks/useNotificaciones';

function App() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const notificaciones = useNotificaciones();

  const renderizarContenido = () => {
    const props = { notificaciones };
    
    switch (seccionActiva) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'solicitudes':
        return <Solicitudes {...props} />;
      case 'clientes':
        return <Clientes {...props} />;
      case 'productos':
        return <Productos {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
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
  );
}

export default App;