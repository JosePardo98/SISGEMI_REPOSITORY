
'use server';

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp, Timestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Equipment, MaintenanceRecord, CorrectiveMaintenanceRecord } from './types';
import { revalidatePath } from 'next/cache';

// Helper function to convert Firestore Timestamps to ISO strings or return other values as is
// Handles fields that might be Timestamps or already strings/undefined
const convertTimestampToISO = (data: any) => {
  if (!data) return data;
  const newObj: { [key: string]: any } = {};
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      newObj[key] = data[key].toDate().toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    } else {
      newObj[key] = data[key];
    }
  }
  return newObj;
};


export async function getEquipments(): Promise<Equipment[]> {
  try {
    const equipmentsCol = collection(db, 'equipments');
    const equipmentSnapshot = await getDocs(query(equipmentsCol, orderBy('id')));
    const equipmentList = equipmentSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestampToISO({ ...data, id: doc.id }) as Equipment;
    });
    return equipmentList;
  } catch (error) {
    console.error("Error fetching equipments:", error);
    throw new Error("No se pudieron cargar los equipos desde Firestore.");
  }
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  try {
    const equipmentRef = doc(db, 'equipments', id);
    const equipmentSnap = await getDoc(equipmentRef);

    if (equipmentSnap.exists()) {
      const data = equipmentSnap.data();
      return convertTimestampToISO({ ...data, id: equipmentSnap.id }) as Equipment;
    } else {
      console.log(`No such document with id: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching equipment by ID:", error);
    throw new Error(`No se pudo cargar el equipo ${id} desde Firestore.`);
  }
}

// --- Preventive Maintenance Records ---
export async function getMaintenanceRecordsForEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  try {
    const recordsCol = collection(db, 'maintenanceRecords');
    const q = query(recordsCol, where('equipmentId', '==', equipmentId));
    const recordSnapshot = await getDocs(q);
    const recordList = recordSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestampToISO({ ...data, id: doc.id }) as MaintenanceRecord;
    });
    return recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching preventive maintenance records:", error);
    throw new Error(`No se pudieron cargar los registros de mantenimiento preventivo para el equipo ${equipmentId}.`);
  }
}

export async function getMaintenanceRecordById(recordId: string): Promise<MaintenanceRecord | undefined> {
  try {
    const recordRef = doc(db, 'maintenanceRecords', recordId);
    const recordSnap = await getDoc(recordRef);

    if (recordSnap.exists()) {
      const data = recordSnap.data();
      return convertTimestampToISO({ ...data, id: recordSnap.id }) as MaintenanceRecord;
    } else {
      console.log(`No such preventive maintenance record with id: ${recordId}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching preventive maintenance record by ID:", error);
    throw new Error(`No se pudo cargar el registro de mantenimiento preventivo ${recordId} desde Firestore.`);
  }
}


export async function addMaintenanceRecord(
  recordData: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  try {
    const newRecordRef = await addDoc(collection(db, 'maintenanceRecords'), {
      ...recordData,
      createdAt: serverTimestamp() 
    });

    const equipmentRef = doc(db, 'equipments', recordData.equipmentId);
    const nextDate = new Date(recordData.date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    await updateDoc(equipmentRef, {
      lastMaintenanceDate: recordData.date, 
      nextMaintenanceDate: nextDate.toISOString().split('T')[0],
      lastTechnician: recordData.technician
    });

    const newRecordSnap = await getDoc(newRecordRef);
    if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new preventive maintenance record");
    
    revalidatePath(`/equipment/${recordData.equipmentId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as MaintenanceRecord;

  } catch (error) {
    console.error("Error adding preventive maintenance record to Firestore:", error);
    throw new Error("No se pudo registrar el mantenimiento preventivo en Firestore.");
  }
}

export async function updateMaintenanceRecord(
  recordId: string,
  equipmentId: string,
  dataToUpdate: Partial<Omit<MaintenanceRecord, 'id' | 'equipmentId'>>
): Promise<MaintenanceRecord> {
  try {
    const recordRef = doc(db, 'maintenanceRecords', recordId);
    await updateDoc(recordRef, dataToUpdate);

    const records = await getMaintenanceRecordsForEquipment(equipmentId);
    const equipmentDocRef = doc(db, 'equipments', equipmentId);

    if (records.length > 0) {
      const latestRecord = records[0]; 
      const nextDate = new Date(latestRecord.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      await updateDoc(equipmentDocRef, {
        lastMaintenanceDate: latestRecord.date,
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        lastTechnician: latestRecord.technician
      });
    } else {
       await updateDoc(equipmentDocRef, {
        lastMaintenanceDate: undefined, 
        nextMaintenanceDate: undefined,
        lastTechnician: undefined
      });
    }
    
    const updatedRecordSnap = await getDoc(recordRef);
    if (!updatedRecordSnap.exists()) throw new Error("Failed to retrieve updated preventive maintenance record");
    
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...updatedRecordSnap.data(), id: updatedRecordSnap.id }) as MaintenanceRecord;
  } catch (error) {
    console.error("Error updating preventive maintenance record:", error);
    throw new Error("No se pudo actualizar el registro de mantenimiento preventivo.");
  }
}

export async function deleteMaintenanceRecord(recordId: string, equipmentId: string): Promise<void> {
  try {
    const recordRef = doc(db, 'maintenanceRecords', recordId);
    await deleteDoc(recordRef);

    const records = await getMaintenanceRecordsForEquipment(equipmentId);
    const equipmentDocRef = doc(db, 'equipments', equipmentId);

    if (records.length > 0) {
      const latestRecord = records[0]; 
      const nextDate = new Date(latestRecord.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      await updateDoc(equipmentDocRef, {
        lastMaintenanceDate: latestRecord.date,
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        lastTechnician: latestRecord.technician
      });
    } else {
      await updateDoc(equipmentDocRef, {
        lastMaintenanceDate: undefined, 
        nextMaintenanceDate: undefined, 
        lastTechnician: undefined
      });
    }
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting preventive maintenance record from Firestore:", error);
    throw new Error("No se pudo eliminar el registro de mantenimiento preventivo de Firestore.");
  }
}

// --- Corrective Maintenance Records ---
export async function getCorrectiveMaintenanceRecordsForEquipment(equipmentId: string): Promise<CorrectiveMaintenanceRecord[]> {
  try {
    const recordsCol = collection(db, 'correctiveMaintenanceRecords');
    // Order by date descending to get the latest first
    const q = query(recordsCol, where('equipmentId', '==', equipmentId)); // orderBy('date', 'desc') might need index
    const recordSnapshot = await getDocs(q);
    const recordList = recordSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestampToISO({ ...data, id: doc.id }) as CorrectiveMaintenanceRecord;
    });
     // Client-side sorting if orderBy is not used or fails due to missing index
    return recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching corrective maintenance records:", error);
    throw new Error(`No se pudieron cargar los registros de mantenimiento correctivo para el equipo ${equipmentId}.`);
  }
}

export async function addCorrectiveMaintenanceRecord(
  recordData: Omit<CorrectiveMaintenanceRecord, 'id'>
): Promise<CorrectiveMaintenanceRecord> {
  try {
    const newRecordRef = await addDoc(collection(db, 'correctiveMaintenanceRecords'), {
      ...recordData,
      createdAt: serverTimestamp()
    });
    
    const newRecordSnap = await getDoc(newRecordRef);
    if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new corrective maintenance record");
    
    revalidatePath(`/equipment/${recordData.equipmentId}`);
    // No revalidatePath('/') as corrective actions might not impact the main list directly
    return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as CorrectiveMaintenanceRecord;

  } catch (error) {
    console.error("Error adding corrective maintenance record to Firestore:", error);
    throw new Error("No se pudo registrar el mantenimiento correctivo en Firestore.");
  }
}

export async function deleteCorrectiveMaintenanceRecord(recordId: string, equipmentId: string): Promise<void> {
  try {
    const recordRef = doc(db, 'correctiveMaintenanceRecords', recordId);
    await deleteDoc(recordRef);
    
    revalidatePath(`/equipment/${equipmentId}`);
  } catch (error) {
    console.error("Error deleting corrective maintenance record from Firestore:", error);
    throw new Error("No se pudo eliminar el registro de mantenimiento correctivo de Firestore.");
  }
}

// --- Equipment Actions ---
export async function addEquipment(
  equipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'specifications' | 'lastTechnician'>
): Promise<Equipment> {
  try {
    const equipmentRef = doc(db, 'equipments', equipmentData.id);
    const equipmentSnap = await getDoc(equipmentRef);

    if (equipmentSnap.exists()) {
      throw new Error(`El equipo con ID ${equipmentData.id} ya existe en Firestore.`);
    }

    const dataToSave = {
        ...equipmentData,
        lastMaintenanceDate: undefined,
        nextMaintenanceDate: undefined,
        lastTechnician: undefined,
    };
    
    await setDoc(equipmentRef, dataToSave);
    
    revalidatePath('/');
    return { ...dataToSave } as Equipment; 

  } catch (error: any) {
    console.error("Error adding equipment to Firestore:", error);
    if (error.message.includes("ya existe")) {
        throw error;
    }
    throw new Error("No se pudo agregar el equipo a Firestore.");
  }
}

export async function updateEquipment(
  equipmentId: string,
  dataToUpdate: Partial<Omit<Equipment, 'id'>>
): Promise<Equipment> {
  try {
    const equipmentRef = doc(db, 'equipments', equipmentId);

    const processedData = { ...dataToUpdate };
    if (processedData.lastMaintenanceDate === '') {
      processedData.lastMaintenanceDate = undefined; 
    }
    if (processedData.nextMaintenanceDate === '') {
      processedData.nextMaintenanceDate = undefined; 
    }
    if (processedData.lastTechnician === '') {
      processedData.lastTechnician = undefined;
    }
    
    if ('specifications' in processedData) {
      delete processedData.specifications;
    }

    await updateDoc(equipmentRef, processedData);
    
    const updatedEquipmentSnap = await getDoc(equipmentRef);
    if (!updatedEquipmentSnap.exists()) throw new Error("Failed to retrieve updated equipment");
    
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...updatedEquipmentSnap.data(), id: updatedEquipmentSnap.id }) as Equipment;
  } catch (error) {
    console.error("Error updating equipment in Firestore:", error);
    throw new Error(`No se pudo actualizar el equipo ${equipmentId} en Firestore.`);
  }
}
