// src/types/interfaces.ts

// Tipos para notificaciones
export type TipoNotificacion = 'success' | 'error' | 'warning' | 'info';

// Interfaces para Firebase Firestore
export interface Cliente {
  id?: string;
  ruc: string;
  razonSocial: string;
  email: string;
  fechaCreacion?: any; // Timestamp de Firebase
}

export interface Producto {
  id?: string;
  nombre: string;
  fechaCreacion?: any; // Timestamp de Firebase
  fechaModificacion?: any; // Timestamp de Firebase
}

export interface Solicitud {
  id?: string;
  clienteId?: string | null;
  productoId: string;
  monto: number;
  estado: 'pendiente' | 'emitida' | 'cancelada';
  fechaSolicitud?: any; // Timestamp de Firebase
  fechaEmision?: any; // Timestamp de Firebase
  fechaCancelacion?: any; // Timestamp de Firebase
  comentarioCancelacion?: string;
  cliente: {
    ruc: string;
    razonSocial: string;
    email: string;
  };
  producto: {
    nombre: string;
  };
}

// Interfaces para componentes
export interface PropsNotificacion {
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion, duracion?: number) => void;
}

export interface PropsDashboard extends PropsNotificacion {}

export interface PropsSolicitudes extends PropsNotificacion {}

export interface PropsClientes extends PropsNotificacion {}

export interface PropsProductos extends PropsNotificacion {}

export interface PropsSidebar {
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
  abierto?: boolean;
  onToggle?: () => void;
}

export interface PropsFormularioSolicitud extends PropsNotificacion {
  mostrar: boolean;
  onCerrar: () => void;
  onSolicitudCreada?: () => void;
}

export interface PropsModalConfirmacion {
  mostrar: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'peligro' | 'advertencia' | 'info';
  cargando?: boolean;
}

// Interfaces para estadísticas
export interface Estadisticas {
  totalSolicitudes: number;
  pendientes: number;
  emitidas: number;
  canceladas: number;
  ventasMes: number;
  solicitudesMes: number;
}

// Tipos para errores de formulario
export interface ErroresFormulario {
  [key: string]: string;
}

// Tipos para estados de carga
export interface EstadoCarga {
  cargando: boolean;
  error: string | null;
}

// Tipos para filtros y búsqueda
export interface FiltrosSolicitudes {
  estado?: 'todos' | 'pendiente' | 'emitida' | 'cancelada';
  fechaInicio?: Date;
  fechaFin?: Date;
  cliente?: string;
  producto?: string;
}

export interface ParametrosBusqueda {
  termino: string;
  campo?: string;
  limite?: number;
}

// Tipos para respuestas de API
export interface RespuestaAPI<T> {
  exito: boolean;
  datos?: T;
  error?: string;
  mensaje?: string;
}

// Tipos para paginación
export interface Paginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

// Tipos para configuración
export interface ConfiguracionApp {
  nombreEmpresa: string;
  rucEmpresa: string;
  direccion: string;
  telefono: string;
  email: string;
  logoUrl?: string;
}

// Tipos para eventos del formulario
export interface EventoFormulario {
  campo: string;
  valor: any;
  esValido: boolean;
}

// Tipos para navegación
export type TipoVista = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';

// Tipos para notificaciones del sistema
export interface NotificacionSistema {
  id: string;
  mensaje: string;
  tipo: TipoNotificacion;
  fechaCreacion: Date;
  duracion?: number;
  leida?: boolean;
}