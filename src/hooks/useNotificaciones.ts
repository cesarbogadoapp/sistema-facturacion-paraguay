// src/hooks/useNotificaciones.ts
import { useState, useCallback } from 'react';

// Tipos para las notificaciones
export type TipoNotificacion = 'success' | 'error' | 'warning' | 'info';

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: TipoNotificacion;
  fechaCreacion: Date;
  duracion?: number;
}

interface UseNotificacionesReturn {
  notificaciones: Notificacion[];
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion, duracion?: number) => void;
  ocultarNotificacion: (id: string) => void;
  limpiarNotificaciones: () => void;
}

// Hook personalizado para gestionar notificaciones
export const useNotificaciones = (): UseNotificacionesReturn => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Función para mostrar una nueva notificación
  const mostrarNotificacion = useCallback((
    mensaje: string, 
    tipo: TipoNotificacion = 'info', 
    duracion: number = 5000
  ) => {
    const nuevaNotificacion: Notificacion = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mensaje,
      tipo,
      fechaCreacion: new Date(),
      duracion
    };

    setNotificaciones(prev => [...prev, nuevaNotificacion]);

    // Auto-eliminar la notificación después de la duración especificada
    if (duracion > 0) {
      setTimeout(() => {
        ocultarNotificacion(nuevaNotificacion.id);
      }, duracion);
    }
  }, []);

  // Función para ocultar una notificación específica
  const ocultarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Función para limpiar todas las notificaciones
  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  return {
    notificaciones,
    mostrarNotificacion,
    ocultarNotificacion,
    limpiarNotificaciones
  };
};

// Hook por defecto para compatibilidad
export default useNotificaciones;