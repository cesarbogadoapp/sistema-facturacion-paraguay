import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// === CLIENTES ===
export const crearCliente = async (clienteData) => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ruc: clienteData.ruc,
      razonSocial: clienteData.razonSocial,
      email: clienteData.email,
      fechaCreacion: serverTimestamp()
    });
    console.log('Cliente creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};

export const buscarClientePorRuc = async (ruc) => {
  try {
    const q = query(collection(db, 'clientes'), where('ruc', '==', ruc));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error buscando cliente:', error);
    throw error;
  }
};

// === PRODUCTOS ===
export const crearProducto = async (nombreProducto) => {
  try {
    const docRef = await addDoc(collection(db, 'productos'), {
      nombre: nombreProducto,
      fechaCreacion: serverTimestamp()
    });
    console.log('Producto creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
};

export const buscarProductoPorNombre = async (nombre) => {
  try {
    const q = query(collection(db, 'productos'), where('nombre', '==', nombre));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error buscando producto:', error);
    throw error;
  }
};

// === SOLICITUDES ===
export const crearSolicitud = async (solicitudData) => {
  try {
    const docRef = await addDoc(collection(db, 'solicitudes'), {
      clienteId: solicitudData.clienteId,
      productoId: solicitudData.productoId,
      monto: parseFloat(solicitudData.monto),
      estado: 'pendiente',
      fechaSolicitud: serverTimestamp(),
      // Guardamos también los datos del cliente y producto para fácil acceso
      cliente: {
        ruc: solicitudData.ruc,
        razonSocial: solicitudData.razonSocial,
        email: solicitudData.email
      },
      producto: {
        nombre: solicitudData.producto
      }
    });
    console.log('Solicitud creada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando solicitud:', error);
    throw error;
  }
};

export const obtenerSolicitudes = async () => {
  try {
    const q = query(
      collection(db, 'solicitudes'), 
      orderBy('fechaSolicitud', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const solicitudes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir timestamp a fecha legible
      fechaSolicitud: doc.data().fechaSolicitud?.toDate()
    }));
    
    console.log('Solicitudes obtenidas:', solicitudes.length);
    return solicitudes;
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    throw error;
  }
};

export const emitirFactura = async (solicitudId) => {
  try {
    const solicitudRef = doc(db, 'solicitudes', solicitudId);
    await updateDoc(solicitudRef, {
      estado: 'emitida',
      fechaEmision: serverTimestamp()
    });
    console.log('Factura emitida para solicitud:', solicitudId);
  } catch (error) {
    console.error('Error emitiendo factura:', error);
    throw error;
  }
};

export const cancelarSolicitud = async (solicitudId, comentario = '') => {
  try {
    const solicitudRef = doc(db, 'solicitudes', solicitudId);
    await updateDoc(solicitudRef, {
      estado: 'cancelada',
      fechaCancelacion: serverTimestamp(),
      comentarioCancelacion: comentario
    });
    console.log('Solicitud cancelada:', solicitudId);
  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    throw error;
  }
};

// === EDITAR Y ELIMINAR PRODUCTOS ===
export const actualizarProducto = async (productoId, nuevoNombre) => {
  try {
    const productoRef = doc(db, 'productos', productoId);
    await updateDoc(productoRef, {
      nombre: nuevoNombre,
      fechaActualizacion: serverTimestamp()
    });
    console.log('Producto actualizado:', productoId);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
};

export const eliminarProducto = async (productoId) => {
  try {
    // Verificar si el producto está siendo usado en solicitudes
    const q = query(collection(db, 'solicitudes'), where('productoId', '==', productoId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('No se puede eliminar el producto porque está siendo usado en solicitudes existentes');
    }
    
    // Si no está siendo usado, eliminarlo
    await deleteDoc(doc(db, 'productos', productoId));
    console.log('Producto eliminado:', productoId);
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
};

// === EDITAR Y ELIMINAR SOLICITUDES ===
export const actualizarSolicitud = async (solicitudId, datosActualizados) => {
  try {
    const solicitudRef = doc(db, 'solicitudes', solicitudId);
    await updateDoc(solicitudRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    console.log('Solicitud actualizada:', solicitudId);
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    throw error;
  }
};

export const eliminarSolicitud = async (solicitudId) => {
  try {
    await deleteDoc(doc(db, 'solicitudes', solicitudId));
    console.log('Solicitud eliminada:', solicitudId);
  } catch (error) {
    console.error('Error eliminando solicitud:', error);
    throw error;
  }
};