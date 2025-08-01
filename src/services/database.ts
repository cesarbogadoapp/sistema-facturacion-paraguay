// src/services/database.ts - ARCHIVO COMPLETO CORREGIDO
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Cliente, Producto, Solicitud, Estadisticas } from '../types/interfaces';

// ========================
// GESTIÓN DE CLIENTES
// ========================
export const crearCliente = async (cliente: Omit<Cliente, 'id' | 'fechaCreacion'>): Promise<Cliente> => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...cliente,
      fechaCreacion: new Date()
    });
    return { id: docRef.id, ...cliente, fechaCreacion: new Date() };
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};

export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'clientes'), orderBy('fechaCreacion', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};

// NUEVO: Listener en tiempo real para clientes
export const escucharClientes = (callback: (clientes: Cliente[]) => void): Unsubscribe => {
  const q = query(collection(db, 'clientes'), orderBy('fechaCreacion', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const clientes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Cliente));
    callback(clientes);
  }, (error) => {
    console.error('Error en listener de clientes:', error);
  });
};

// ========================
// GESTIÓN DE PRODUCTOS
// ========================
export const crearProducto = async (producto: Omit<Producto, 'id' | 'fechaCreacion'>): Promise<Producto> => {
  try {
    const docRef = await addDoc(collection(db, 'productos'), {
      nombre: producto.nombre,
      fechaCreacion: new Date()
    });
    return { id: docRef.id, nombre: producto.nombre, fechaCreacion: new Date() };
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'productos'), orderBy('fechaCreacion', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      nombre: doc.data().nombre,
      fechaCreacion: doc.data().fechaCreacion
    } as Producto));
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

// Listener en tiempo real para productos
export const escucharProductos = (callback: (productos: Producto[]) => void): Unsubscribe => {
  const q = query(collection(db, 'productos'), orderBy('fechaCreacion', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const productos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre,
      fechaCreacion: doc.data().fechaCreacion
    } as Producto));
    callback(productos);
  }, (error) => {
    console.error('Error en listener de productos:', error);
  });
};

export const actualizarProducto = async (id: string, datos: Partial<Producto>): Promise<Producto> => {
  try {
    const productoRef = doc(db, 'productos', id);
    await updateDoc(productoRef, {
      nombre: datos.nombre,
      fechaModificacion: new Date()
    });
    return { id, ...datos } as Producto;
  } catch (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
};

export const eliminarProducto = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el producto está siendo usado en solicitudes
    const solicitudesQuery = query(
      collection(db, 'solicitudes'), 
      where('productoId', '==', id)
    );
    const solicitudesSnapshot = await getDocs(solicitudesQuery);
    
    if (!solicitudesSnapshot.empty) {
      throw new Error('No se puede eliminar el producto porque está siendo usado en solicitudes');
    }

    await deleteDoc(doc(db, 'productos', id));
    return true;
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
};

// ========================
// GESTIÓN DE SOLICITUDES - MEJORADA CON LISTENERS
// ========================
export const crearSolicitud = async (solicitud: Omit<Solicitud, 'id' | 'estado' | 'fechaSolicitud'>): Promise<Solicitud> => {
  try {
    const docRef = await addDoc(collection(db, 'solicitudes'), {
      ...solicitud,
      estado: 'pendiente',
      fechaSolicitud: new Date()
    });
    return { id: docRef.id, ...solicitud, estado: 'pendiente', fechaSolicitud: new Date() } as Solicitud;
  } catch (error) {
    console.error('Error creando solicitud:', error);
    throw error;
  }
};

export const obtenerSolicitudes = async (): Promise<Solicitud[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'solicitudes'), orderBy('fechaSolicitud', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitud));
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    throw error;
  }
};

// ✨ CLAVE: Listener en tiempo real para solicitudes - SOLUCIÓN PRINCIPAL
export const escucharSolicitudes = (callback: (solicitudes: Solicitud[]) => void): Unsubscribe => {
  const q = query(collection(db, 'solicitudes'), orderBy('fechaSolicitud', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    try {
      const solicitudes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Solicitud));
      callback(solicitudes);
    } catch (error) {
      console.error('Error procesando snapshot de solicitudes:', error);
    }
  }, (error) => {
    console.error('Error en listener de solicitudes:', error);
    // En caso de error, intentar reconectar
    setTimeout(() => {
      escucharSolicitudes(callback);
    }, 5000);
  });
};

// ✨ MEJORADA: Emitir factura con confirmación explícita
export const emitirFactura = async (solicitudId: string): Promise<boolean> => {
  try {
    const solicitudRef = doc(db, 'solicitudes', solicitudId);
    
    // Actualizar con confirmación explícita
    await updateDoc(solicitudRef, {
      estado: 'emitida',
      fechaEmision: new Date(),
      fechaModificacion: new Date()
    });
    
    // Esperar un momento para asegurar que se escribió
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Error emitiendo factura:', error);
    throw error;
  }
};

// ✨ MEJORADA: Cancelar solicitud con confirmación explícita
export const cancelarSolicitud = async (solicitudId: string, comentario: string = ''): Promise<boolean> => {
  try {
    const solicitudRef = doc(db, 'solicitudes', solicitudId);
    
    // Actualizar con confirmación explícita
    await updateDoc(solicitudRef, {
      estado: 'cancelada',
      fechaCancelacion: new Date(),
      comentarioCancelacion: comentario,
      fechaModificacion: new Date()
    });
    
    // Esperar un momento para asegurar que se escribió
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    throw error;
  }
};

// ✨ MEJORADA: Actualizar solicitud con confirmación explícita
export const actualizarSolicitud = async (id: string, datosActualizados: Partial<Solicitud>): Promise<boolean> => {
  try {
    const solicitudRef = doc(db, 'solicitudes', id);
    
    // Actualizar con confirmación explícita
    await updateDoc(solicitudRef, {
      ...datosActualizados,
      fechaModificacion: new Date()
    });
    
    // Esperar un momento para asegurar que se escribió
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    throw error;
  }
};

// ========================
// ESTADÍSTICAS Y MÉTRICAS - MEJORADAS
// ========================
export const obtenerEstadisticas = async (): Promise<Estadisticas> => {
  try {
    const solicitudesSnapshot = await getDocs(collection(db, 'solicitudes'));
    const solicitudes = solicitudesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Solicitud));

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const solicitudesMes = solicitudes.filter(s => {
      const fechaSolicitud = s.fechaSolicitud?.toDate ? s.fechaSolicitud.toDate() : new Date(s.fechaSolicitud);
      return fechaSolicitud >= inicioMes;
    });

    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const emitidas = solicitudes.filter(s => s.estado === 'emitida').length;
    const canceladas = solicitudes.filter(s => s.estado === 'cancelada').length;

    const ventasMes = solicitudesMes
      .filter(s => s.estado === 'emitida')
      .reduce((sum, s) => sum + (s.monto || 0), 0);

    return {
      totalSolicitudes: solicitudes.length,
      pendientes,
      emitidas,
      canceladas,
      ventasMes,
      solicitudesMes: solicitudesMes.length
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// ✨ Listener en tiempo real para estadísticas
export const escucharEstadisticas = (callback: (estadisticas: Estadisticas) => void): Unsubscribe => {
  return onSnapshot(collection(db, 'solicitudes'), async () => {
    try {
      const estadisticas = await obtenerEstadisticas();
      callback(estadisticas);
    } catch (error) {
      console.error('Error calculando estadísticas en tiempo real:', error);
    }
  });
};

// ========================
// FUNCIONES DE BÚSQUEDA
// ========================
export const buscarClientes = async (termino: string): Promise<Cliente[]> => {
  try {
    const clientes = await obtenerClientes();
    return clientes.filter(cliente => 
      cliente.razonSocial.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.ruc.includes(termino) ||
      cliente.email.toLowerCase().includes(termino.toLowerCase())
    );
  } catch (error) {
    console.error('Error buscando clientes:', error);
    throw error;
  }
};

export const buscarProductos = async (termino: string): Promise<Producto[]> => {
  try {
    const productos = await obtenerProductos();
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(termino.toLowerCase())
    );
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
};

// ========================
// FUNCIONES DE COMPATIBILIDAD
// ========================
export const buscarClientePorRuc = async (ruc: string): Promise<Cliente | null> => {
  try {
    const clientes = await buscarClientes(ruc);
    return clientes.find(cliente => cliente.ruc === ruc) || null;
  } catch (error) {
    console.error('Error buscando cliente por RUC:', error);
    return null;
  }
};

export const buscarProductoPorNombre = async (nombre: string): Promise<Producto | null> => {
  try {
    const productos = await buscarProductos(nombre);
    return productos.find(producto => producto.nombre.toLowerCase() === nombre.toLowerCase()) || null;
  } catch (error) {
    console.error('Error buscando producto por nombre:', error);
    return null;
  }
};