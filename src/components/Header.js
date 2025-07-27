import React from 'react';

const Header = () => {
  return (
    <header style={{ 
      backgroundColor: '#2563eb', 
      color: 'white', 
      padding: '1rem 2rem',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          📋 Sistema de Facturación
        </h1>
        <div style={{ fontSize: '0.9rem' }}>
          ¡Bienvenido, Javier! 👋
        </div>
      </div>
    </header>
  );
};

export default Header;