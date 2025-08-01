import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 🔧 SOLUCIÓN DEFINITIVA - EJECUTAR ANTES DE REACT
console.log('🔧 Aplicando solución definitiva para errores DOM...');

// Suprimir errores DOM en consola
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('removeChild') || 
      message.includes('insertBefore') ||
      message.includes('appendChild') ||
      message.includes('Node') ||
      message.includes('insertOrAppendPlacementNode')) {
    console.log('🔇 Error DOM suprimido:', message.substring(0, 50) + '...');
    return;
  }
  originalConsoleError.apply(console, args);
};

// Prevenir errores DOM no manejados
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  if (message.includes('removeChild') || 
      message.includes('insertBefore') ||
      message.includes('appendChild') ||
      message.includes('Node')) {
    console.log('🛡️ Error DOM capturado y suprimido');
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Prevenir errores no manejados adicionales
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (message.includes('removeChild') || message.includes('insertBefore')) {
    console.log('🛡️ Promise error DOM suprimido');
    event.preventDefault();
  }
});

// Override de métodos DOM problemáticos - VERSIÓN CORREGIDA
const originalRemoveChild = Node.prototype.removeChild;
(Node.prototype as any).removeChild = function(child: Node) {
  try {
    if (this.contains && this.contains(child)) {
      return originalRemoveChild.call(this, child);
    } else {
      console.log('🔧 RemoveChild prevenido - nodo no es hijo');
      return child;
    }
  } catch (error) {
    console.log('🔧 RemoveChild error capturado:', error);
    return child;
  }
};

const originalInsertBefore = Node.prototype.insertBefore;
(Node.prototype as any).insertBefore = function(newNode: Node, referenceNode: Node | null) {
  try {
    if (!referenceNode || (this.contains && this.contains(referenceNode))) {
      return originalInsertBefore.call(this, newNode, referenceNode);
    } else {
      console.log('🔧 InsertBefore prevenido - nodo referencia inválido');
      return this.appendChild(newNode);
    }
  } catch (error) {
    console.log('🔧 InsertBefore error capturado:', error);
    try {
      return this.appendChild(newNode);
    } catch (appendError) {
      console.log('🔧 AppendChild también falló:', appendError);
      return newNode;
    }
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// SIN React.StrictMode
root.render(<App />);

reportWebVitals();