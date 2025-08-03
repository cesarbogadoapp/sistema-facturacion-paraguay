// src/types/interfaces.ts - CÓDIGO COMPLETO Y CORREGIDO

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

// ✨ NUEVA INTERFACE: ProductoSolicitud
export interface ProductoSolicitud {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// ✨ INTERFACE PRINCIPAL CORREGIDA - Solicitud con soporte completo
export interface Solicitud {
  id?: string;
  clienteId?: string | null;
  productoId: string; // Legacy - para compatibilidad
  monto: number;
  estado: 'pendiente' | 'emitida' | 'cancelada';
  fechaSolicitud?: any; // Timestamp de Firebase
  fechaEmision?: any; // Timestamp de Firebase
  fechaCancelacion?: any; // Timestamp de Firebase
  comentarioCancelacion?: string;
  
  // ✨ NUEVOS CAMPOS PRINCIPALES
  productos?: ProductoSolicitud[]; // Array de productos con detalles
  numeroGuia?: string; // Número de guía logística
  
  // Legacy - mantener para compatibilidad
  cliente: {
    ruc: string;
    razonSocial: string;
    email: string;
  };
  producto: {
    nombre: string; // Nombre del primer producto (legacy)
  };
}

// ✨ NUEVA INTERFACE: Datos para crear solicitud
export interface DatosSolicitud {
  clienteId?: string | null;
  productoId: string; // Legacy - primer producto
  monto: number;
  productos?: ProductoSolicitud[]; // Nuevo array de productos
  numeroGuia?: string;
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

export interface PropsDashboard extends PropsNotificacion {
  onCambiarVista?: (vista: 'solicitudes' | 'clientes' | 'productos') => void;
}

export interface PropsSolicitudes extends PropsNotificacion {}

export interface PropsClientes extends PropsNotificacion {}

export interface PropsProductos extends PropsNotificacion {}

export interface PropsSidebar {
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
  abierto?: boolean;
  onToggle?: () => void;
  usuario?: any;
  onCerrarSesion?: () => void;
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
  mostrarCampoComentario?: boolean;
  comentario?: string;
  onComentarioChange?: (comentario: string) => void;
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

// ✨ NUEVA INTERFACE: Errores específicos del formulario mejorado
export interface ErroresFormularioMejorado {
  ruc?: string;
  razonSocial?: string;
  email?: string;
  productos?: string;
  [key: string]: string | undefined;
}

// ✨ NUEVA INTERFACE: Datos del formulario mejorado
export interface DatosFormularioMejorado {
  ruc: string;
  razonSocial: string;
  email: string;
  productos: ProductoSolicitud[];
  numeroGuia: string;
}

// Tipos para estados de carga
export interface EstadoCarga {
  cargando: boolean;
  error: string | null;
}

// ✨ NUEVO: Estado de carga específico por ID
export interface EstadoCargaPorId {
  [id: string]: boolean;
}

// Tipos para filtros y búsqueda
export interface FiltrosSolicitudes {
  estado?: 'todos' | 'pendiente' | 'emitida' | 'cancelada';
  fecha?: 'todas' | 'hoy' | 'ayer' | 'esta_semana' | 'este_mes' | 'mes_pasado';
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

// ✨ NUEVO: Evento específico para productos
export interface EventoProducto {
  index: number;
  campo: keyof ProductoSolicitud;
  valor: any;
  producto: ProductoSolicitud;
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

// ✨ NUEVA INTERFACE: Props del hook de notificaciones
export interface UseNotificacionesReturn {
  notificaciones: NotificacionSistema[];
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion, duracion?: number) => void;
  ocultarNotificacion: (id: string) => void;
  limpiarNotificaciones: () => void;
}

// ✨ NUEVA INTERFACE: Cliente sugerido en autocompletado
export interface ClienteSugerido extends Cliente {
  puntuacion?: number; // Para ordenar sugerencias
  coincidencia?: string; // Campo donde se encontró la coincidencia
}

// ✨ NUEVA INTERFACE: Resumen de solicitud
export interface ResumenSolicitud {
  totalProductos: number;
  montoTotal: number;
  tieneGuia: boolean;
  productosValidos: number;
}

// ✨ NUEVA INTERFACE: Estadísticas por cliente
export interface EstadisticasCliente {
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesEmitidas: number;
  solicitudesCanceladas: number;
  montoTotal: number;
  montoPromedio: number;
  ultimaSolicitud?: Date;
}

// ✨ NUEVA INTERFACE: Filtros avanzados
export interface FiltrosAvanzados extends FiltrosSolicitudes {
  montoMinimo?: number;
  montoMaximo?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  conGuia?: boolean;
  multiProducto?: boolean;
}

// ✨ NUEVA INTERFACE: Datos de exportación CSV
export interface DatosCSV {
  id: string;
  cliente: string;
  ruc: string;
  email: string;
  productos: string; // Lista concatenada
  monto: string;
  estado: string;
  fechaSolicitud: string;
  fechaEmision?: string;
  numeroGuia?: string;
  cantidadProductos: number;
}

// ✨ NUEVA INTERFACE: Respuesta de validación
export interface ResultadoValidacion {
  esValido: boolean;
  errores: ErroresFormulario;
  advertencias?: string[];
}

// ✨ NUEVA INTERFACE: Configuración del formulario
export interface ConfigFormulario {
  permitirMultiplesProductos: boolean;
  requierirGuia: boolean;
  validacionEstricta: boolean;
  autocompletarClientes: boolean;
}

// ✨ NUEVA INTERFACE: Modal de edición de solicitud
export interface PropsModalEdicion {
  mostrar: boolean;
  solicitud: Solicitud | null;
  onGuardar: (solicitudEditada: Solicitud) => void;
  onCancelar: () => void;
  cargando: boolean;
  clientes: Cliente[];
  productos: Producto[];
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion) => void;
}

// ✨ NUEVA INTERFACE: Datos de edición
export interface DatosEdicion {
  ruc: string;
  razonSocial: string;
  email: string;
  productos: ProductoSolicitud[];
  numeroGuia: string;
  monto: number;
}

// ✨ NUEVA INTERFACE: Historial de cambios
export interface CambioSolicitud {
  id: string;
  solicitudId: string;
  fecha: Date;
  usuario: string;
  accion: 'creada' | 'editada' | 'emitida' | 'cancelada';
  detalles: string;
  valoresAnteriores?: any;
  valoresNuevos?: any;
}

// ✨ NUEVA INTERFACE: Configuración de listeners
export interface ConfiguracionListener {
  tiempo: number;
  reintentos: number;
  intervaloReintento: number;
}

// ✨ NUEVA TYPE: Estados de procesamiento
export type EstadoProcesamiento = 'idle' | 'cargando' | 'guardando' | 'emitiendo' | 'cancelando' | 'error';

// ✨ NUEVA INTERFACE: Context de la aplicación
export interface AppContext {
  usuario: any;
  configuracion: ConfiguracionApp;
  estadisticas: Estadisticas;
  solicitudes: Solicitud[];
  clientes: Cliente[];
  productos: Producto[];
  cargando: boolean;
  error: string | null;
}

// ✨ NUEVA INTERFACE: Props del provider
export interface AppProviderProps {
  children: React.ReactNode;
}

// ✨ NUEVA INTERFACE: Notificación con ID
export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: TipoNotificacion;
  fechaCreacion: Date;
  duracion?: number;
}

// ✨ NUEVA INTERFACE: Props para componente de notificaciones
export interface NotificacionesProps {
  notificaciones: Notificacion[];
  onOcultar: (id: string) => void;
}

// ✨ NUEVA INTERFACE: Props para Admin Delete
export interface AdminDeleteProps {
  mostrar: boolean;
  onCerrar: () => void;
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion) => void;
}

// ✨ NUEVA INTERFACE: Registro unificado para Admin Delete
export interface RegistroUnificado {
  id: string;
  tipo: 'solicitudes' | 'clientes' | 'productos';
  titulo: string;
  subtitulo: string;
  descripcion: string;
  estado?: string;
  fecha: Date;
  datos: any;
}

// ✨ NUEVA INTERFACE: Props del Header
export interface HeaderProps {
  titulo: string;
  subtitulo?: string;
}

// ✨ NUEVA INTERFACE: Props del Login
export interface LoginProps {}

// ✨ NUEVA INTERFACE: Usuario de Firebase
export interface UsuarioFirebase {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// ✨ NUEVA INTERFACE: Respuesta de autenticación
export interface RespuestaAuth {
  exito: boolean;
  usuario?: UsuarioFirebase;
  error?: string;
}

// ✨ NUEVA INTERFACE: Configuración de Firebase
export interface ConfigFirebase {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// ✨ NUEVA INTERFACE: Opciones de búsqueda
export interface OpcionesBusqueda {
  caseSensitive?: boolean;
  busquedaCompleta?: boolean;
  campos?: string[];
  limite?: number;
}

// ✨ NUEVA INTERFACE: Resultado de búsqueda
export interface ResultadoBusqueda<T> {
  resultados: T[];
  total: number;
  tiempo: number;
  consulta: string;
}

// ✨ NUEVA INTERFACE: Métricas de rendimiento
export interface MetricasRendimiento {
  tiempoCarga: number;
  cantidadElementos: number;
  errores: number;
  warnings: number;
}

// ✨ NUEVA INTERFACE: Log de sistema
export interface LogSistema {
  id: string;
  timestamp: Date;
  nivel: 'info' | 'warning' | 'error' | 'debug';
  mensaje: string;
  componente: string;
  datos?: any;
}

// ✨ NUEVA INTERFACE: Configuración de tema
export interface ConfiguracionTema {
  modo: 'claro' | 'oscuro' | 'auto';
  colorPrimario: string;
  colorSecundario: string;
  fuente: string;
}

// ✨ NUEVA INTERFACE: Preferencias de usuario
export interface PreferenciasUsuario {
  tema: ConfiguracionTema;
  idioma: string;
  notificaciones: boolean;
  autoguardado: boolean;
  compactarVistas: boolean;
}

// Exportaciones de tipos útiles
export type EstadoSolicitud = Solicitud['estado'];
export type CampoProducto = keyof ProductoSolicitud;
export type CampoCliente = keyof Cliente;
export type CampoFormulario = keyof DatosFormularioMejorado;
export type TipoRegistro = RegistroUnificado['tipo'];
export type NivelLog = LogSistema['nivel'];
export type ModoTema = ConfiguracionTema['modo'];

// ✨ TIPOS AUXILIARES: Para operaciones comunes
export type ID = string;
export type Timestamp = any; // Para timestamps de Firebase
export type Callback<T = void> = () => T;
export type CallbackConParametro<P, T = void> = (parametro: P) => T;
export type EventHandler<E = Event> = (evento: E) => void;

// ✨ TIPOS CONDICIONALES: Para mayor flexibilidad
export type ConID<T> = T & { id: string };
export type SinID<T> = Omit<T, 'id'>;
export type Opcional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Requerido<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ✨ UNIONES DE TIPOS: Para validaciones
export type EstadosValidos = 'pendiente' | 'emitida' | 'cancelada';
export type TiposNotificacion = 'success' | 'error' | 'warning' | 'info';
export type VistasApp = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';
export type TiposRegistros = 'solicitudes' | 'clientes' | 'productos';

// ✨ MAPEO DE TIPOS: Para transformaciones
export type MapeoEstados = {
  [K in EstadosValidos]: {
    label: string;
    color: string;
    icono: string;
  };
};

export type MapeoTiposNotificacion = {
  [K in TiposNotificacion]: {
    icono: string;
    color: string;
    duracion: number;
  };
};

// ✨ CONSTANTES DE TIPOS: Para validaciones
export const ESTADOS_SOLICITUD: EstadosValidos[] = ['pendiente', 'emitida', 'cancelada'];
export const TIPOS_NOTIFICACION: TiposNotificacion[] = ['success', 'error', 'warning', 'info'];
export const VISTAS_APP: VistasApp[] = ['dashboard', 'solicitudes', 'clientes', 'productos'];
export const TIPOS_REGISTROS: TiposRegistros[] = ['solicitudes', 'clientes', 'productos'];

// ✨ VALIDADORES DE TIPOS: Para runtime checks
export const esEstadoValido = (estado: string): estado is EstadosValidos => {
  return ESTADOS_SOLICITUD.includes(estado as EstadosValidos);
};

export const esTipoNotificacionValido = (tipo: string): tipo is TiposNotificacion => {
  return TIPOS_NOTIFICACION.includes(tipo as TiposNotificacion);
};

export const esVistaValida = (vista: string): vista is VistasApp => {
  return VISTAS_APP.includes(vista as VistasApp);
};

export const esTipoRegistroValido = (tipo: string): tipo is TiposRegistros => {
  return TIPOS_REGISTROS.includes(tipo as TiposRegistros);
};

// ✨ UTILIDADES DE TIPOS: Para desarrollo
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type NonNullable<T> = T extends null | undefined ? never : T;

// ✨ INTERFACES FINALES: Para casos específicos
export interface RespuestaOperacion {
  exito: boolean;
  mensaje?: string;
  datos?: any;
  errores?: string[];
}

export interface ConfiguracionCompleta {
  app: ConfiguracionApp;
  firebase: ConfigFirebase;
  tema: ConfiguracionTema;
  formulario: ConfigFormulario;
  listeners: ConfiguracionListener;
}

export interface EstadoAplicacion {
  usuario: UsuarioFirebase | null;
  autenticado: boolean;
  cargando: boolean;
  error: string | null;
  vista: VistasApp;
  datos: {
    solicitudes: Solicitud[];
    clientes: Cliente[];
    productos: Producto[];
    estadisticas: Estadisticas;
  };
  configuracion: ConfiguracionCompleta;
}

// Export por defecto
export default {};

// Re-exportaciones para compatibilidad
export type { TipoNotificacion as NotificationType };
export type { ProductoSolicitud as SolicitudProducto };
export type { DatosFormularioMejorado as FormularioMejoradoDatos };
export type { EstadosValidos as ValidStates };
export type { VistasApp as AppViews };

// Validación final de tipos
declare global {
  interface Window {
    __TIPO_DESARROLLO__?: boolean;
    __CONFIGURACION_APP__?: ConfiguracionCompleta;
  }
}