import { useState, useCallback, useContext } from 'react';
import { NotificacionesContext } from '../App';

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  const agregarNotificacion = useCallback((tipo, titulo, mensaje, duracion = 5000) => {
    const id = Date.now() + Math.random();
    const nuevaNotificacion = {
      id,
      tipo,
      titulo,
      mensaje,
      duracion
    };

    setNotificaciones(prev => [...prev, nuevaNotificacion]);
    return id;
  }, []);

  const removerNotificacion = useCallback((id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  // Métodos de conveniencia
  const exito = useCallback((titulo, mensaje, duracion = 5000) => {
    return agregarNotificacion('exito', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const error = useCallback((titulo, mensaje, duracion = 5000) => {
    return agregarNotificacion('error', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const advertencia = useCallback((titulo, mensaje, duracion = 5000) => {
    return agregarNotificacion('advertencia', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const info = useCallback((titulo, mensaje, duracion = 5000) => {
    return agregarNotificacion('info', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  return {
    notificaciones,
    agregarNotificacion,
    removerNotificacion,
    limpiarNotificaciones,
    exito,
    error,
    advertencia,
    info
  };
};

// Hook para usar notificaciones en cualquier componente
export const useNotificacionesContext = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    // Devolver un objeto con funciones vacías para evitar errores
    return {
      notificaciones: [],
      agregarNotificacion: () => {},
      removerNotificacion: () => {},
      limpiarNotificaciones: () => {},
      exito: () => {},
      error: () => {},
      advertencia: () => {},
      info: () => {}
    };
  }
  return context;
};