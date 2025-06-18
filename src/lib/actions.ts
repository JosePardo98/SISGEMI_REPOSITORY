
'use server';

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp, Timestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Equipment, MaintenanceRecord } from './types';
import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';
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

export async function getMaintenanceRecordsForEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  try {
    const recordsCol = collection(db, 'maintenanceRecords');
    const q = query(recordsCol, where('equipmentId', '==', equipmentId), orderBy('date', 'desc'));
    const recordSnapshot = await getDocs(q);
    const recordList = recordSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestampToISO({ ...data, id: doc.id }) as MaintenanceRecord;
    });
    return recordList;
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    throw new Error(`No se pudieron cargar los registros de mantenimiento para el equipo ${equipmentId}.`);
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
      console.log(`No such maintenance record with id: ${recordId}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching maintenance record by ID:", error);
    throw new Error(`No se pudo cargar el registro de mantenimiento ${recordId} desde Firestore.`);
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
      nextMaintenanceDate: nextDate.toISOString().split('T')[0] 
    });

    console.log('New maintenance record added to Firestore with ID:', newRecordRef.id);
    const newRecordSnap = await getDoc(newRecordRef);
    if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new maintenance record");
    
    revalidatePath(`/equipment/${recordData.equipmentId}`);
    return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as MaintenanceRecord;

  } catch (error) {
    console.error("Error adding maintenance record to Firestore:", error);
    throw new Error("No se pudo registrar el mantenimiento en Firestore.");
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

    // If the date was updated, potentially update the equipment's lastMaintenanceDate
    if (dataToUpdate.date) {
      const records = await getMaintenanceRecordsForEquipment(equipmentId);
      if (records.length > 0) {
        const latestRecord = records[0]; // Already sorted by date desc
        const nextDate = new Date(latestRecord.date);
        nextDate.setMonth(nextDate.getMonth() + 6);
        await updateDoc(doc(db, 'equipments', equipmentId), {
          lastMaintenanceDate: latestRecord.date,
          nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        });
      } else {
         await updateDoc(doc(db, 'equipments', equipmentId), {
          lastMaintenanceDate: null, // Or undefined, depending on preference
          nextMaintenanceDate: null,
        });
      }
    }
    
    const updatedRecordSnap = await getDoc(recordRef);
    if (!updatedRecordSnap.exists()) throw new Error("Failed to retrieve updated maintenance record");
    
    revalidatePath(`/equipment/${equipmentId}`);
    return convertTimestampToISO({ ...updatedRecordSnap.data(), id: updatedRecordSnap.id }) as MaintenanceRecord;
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    throw new Error("No se pudo actualizar el registro de mantenimiento.");
  }
}

export async function deleteMaintenanceRecord(recordId: string, equipmentId: string): Promise<void> {
  try {
    const recordRef = doc(db, 'maintenanceRecords', recordId);
    await deleteDoc(recordRef);
    console.log('Maintenance record deleted from Firestore:', recordId);

    // After deleting, recalculate lastMaintenanceDate and nextMaintenanceDate for the equipment
    const records = await getMaintenanceRecordsForEquipment(equipmentId);
    const equipmentRef = doc(db, 'equipments', equipmentId);

    if (records.length > 0) {
      const latestRecord = records[0]; // Already sorted by date desc in getMaintenanceRecordsForEquipment
      const nextDate = new Date(latestRecord.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      await updateDoc(equipmentRef, {
        lastMaintenanceDate: latestRecord.date,
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
      });
    } else {
      // No maintenance records left, clear the dates
      await updateDoc(equipmentRef, {
        lastMaintenanceDate: null, // OrFieldValue.delete() if you want to remove the field
        nextMaintenanceDate: null, // Or FieldValue.delete()
      });
    }
    revalidatePath(`/equipment/${equipmentId}`);
  } catch (error) {
    console.error("Error deleting maintenance record from Firestore:", error);
    throw new Error("No se pudo eliminar el registro de mantenimiento de Firestore.");
  }
}


export async function addEquipment(
  equipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'specifications'>
): Promise<Equipment> {
  try {
    const equipmentRef = doc(db, 'equipments', equipmentData.id);
    const equipmentSnap = await getDoc(equipmentRef);

    if (equipmentSnap.exists()) {
      throw new Error(`El equipo con ID ${equipmentData.id} ya existe en Firestore.`);
    }

    const dataToSave = {
        ...equipmentData,
    };
    
    await setDoc(equipmentRef, dataToSave);
    
    console.log('New equipment added to Firestore:', equipmentData.id);
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
    
    if ('specifications' in processedData) {
      delete processedData.specifications;
    }

    await updateDoc(equipmentRef, processedData);
    
    console.log('Equipment updated in Firestore:', equipmentId);
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

export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  try {
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    return { suggestedProcedures: "Error al obtener sugerencias de IA. Verifique la conexión o inténtelo más tarde." };
  }
}
