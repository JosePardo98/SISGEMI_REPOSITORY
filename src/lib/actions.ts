
'use server';

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Equipment, MaintenanceRecord } from './types';
import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';

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
      // Ensure dates are strings if they are Timestamps
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
    // Removed orderBy('date', 'desc') to avoid needing a composite index immediately.
    // The MaintenanceHistoryTable component already sorts client-side.
    const q = query(recordsCol, where('equipmentId', '==', equipmentId));
    const recordSnapshot = await getDocs(q);
    const recordList = recordSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure date is a string if it's a Timestamp
      return convertTimestampToISO({ ...data, id: doc.id }) as MaintenanceRecord;
    });
    // Client-side sorting as a fallback or if server-side is removed.
    // Note: The MaintenanceHistoryTable component also does its own sorting.
    // This ensures data is sorted if used elsewhere or if table sorting is removed.
    recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return recordList;
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    throw new Error(`No se pudieron cargar los registros de mantenimiento para el equipo ${equipmentId}.`);
  }
}

export async function addMaintenanceRecord(
  recordData: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  try {
    // Ensure date is stored consistently, Firestore Timestamps are preferred for querying.
    // However, if recordData.date is YYYY-MM-DD string, Firestore can store it as string.
    // For this example, we'll assume recordData.date is already a YYYY-MM-DD string.
    // If it needs conversion to Timestamp for Firestore, do it here.
    // const firestoreDate = Timestamp.fromDate(new Date(recordData.date));

    const newRecordRef = await addDoc(collection(db, 'maintenanceRecords'), {
      ...recordData,
      // date: firestoreDate, // If using Firestore Timestamp
      createdAt: serverTimestamp() // Optional: for tracking creation time
    });

    const equipmentRef = doc(db, 'equipments', recordData.equipmentId);
    const nextDate = new Date(recordData.date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    await updateDoc(equipmentRef, {
      lastMaintenanceDate: recordData.date, // Assuming YYYY-MM-DD string
      nextMaintenanceDate: nextDate.toISOString().split('T')[0] // YYYY-MM-DD string
    });

    console.log('New maintenance record added to Firestore with ID:', newRecordRef.id);
    // Fetch the newly added record to return it with its ID
    const newRecordSnap = await getDoc(newRecordRef);
    if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new maintenance record");
    
    return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as MaintenanceRecord;

  } catch (error) {
    console.error("Error adding maintenance record to Firestore:", error);
    throw new Error("No se pudo registrar el mantenimiento en Firestore.");
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

    // Dates will be set via maintenance records or updates.
    // Ensure all provided date fields are correctly formatted if any.
    const dataToSave = {
        ...equipmentData,
        // lastMaintenanceDate and nextMaintenanceDate are optional and typically set by maintenance actions
    };
    
    await setDoc(equipmentRef, dataToSave);
    
    console.log('New equipment added to Firestore:', equipmentData.id);
    return { ...dataToSave } as Equipment; // id is already part of equipmentData

  } catch (error: any) {
    console.error("Error adding equipment to Firestore:", error);
    // Re-throw specific error message if it's the "already exists" error
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
    // Handle empty date strings by converting them to undefined or null for Firestore
    // Or ensure they are valid date strings if not empty
    if (processedData.lastMaintenanceDate === '') {
      processedData.lastMaintenanceDate = undefined; // Or null
    }
    if (processedData.nextMaintenanceDate === '') {
      processedData.nextMaintenanceDate = undefined; // Or null
    }
    
    // Remove 'specifications' if it's part of the update, as it's deprecated
    if ('specifications' in processedData) {
      delete processedData.specifications;
    }

    await updateDoc(equipmentRef, processedData);
    
    console.log('Equipment updated in Firestore:', equipmentId);
    const updatedEquipmentSnap = await getDoc(equipmentRef);
    if (!updatedEquipmentSnap.exists()) throw new Error("Failed to retrieve updated equipment");

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
    // Adding a slight delay to simulate network latency if needed,
    // but the main delay is from the Genkit call itself.
    // await new Promise(resolve => setTimeout(resolve, 200)); 
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    // Return a more specific error or a default suggestion structure
    return { suggestedProcedures: "Error al obtener sugerencias de IA. Verifique la conexión o inténtelo más tarde." };
  }
}

