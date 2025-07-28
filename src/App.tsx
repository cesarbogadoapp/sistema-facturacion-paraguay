import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Solicitudes from './components/Solicitudes';
import Clientes from './components/Clientes';
import Productos from './components/Productos';

function App() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

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
    </div>
  );
}

export default App;