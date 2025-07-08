
'use server';

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp, Timestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Equipment, MaintenanceRecord, CorrectiveMaintenanceRecord, Ticket, Peripheral, PeripheralMaintenanceRecord } from './types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

// --- Zod Schemas for Validation ---
const AddMaintenanceRecordInputSchema = z.object({
  equipmentId: z.string(),
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

const UpdateMaintenanceRecordInputSchema = AddMaintenanceRecordInputSchema.omit({ equipmentId: true }).partial();


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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
}


export async function addMaintenanceRecord(
  recordData: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  try {
    const validatedData = AddMaintenanceRecordInputSchema.parse(recordData);

    const newRecordRef = await addDoc(collection(db, 'maintenanceRecords'), {
      ...validatedData,
      createdAt: serverTimestamp() 
    });

    const equipmentRef = doc(db, 'equipments', validatedData.equipmentId);
    const nextDate = new Date(validatedData.date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    await updateDoc(equipmentRef, {
      lastMaintenanceDate: validatedData.date, 
      nextMaintenanceDate: nextDate.toISOString().split('T')[0],
      lastTechnician: validatedData.technician
    });

    const newRecordSnap = await getDoc(newRecordRef);
    if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new preventive maintenance record");
    
    revalidatePath(`/equipment/${validatedData.equipmentId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as MaintenanceRecord;

  } catch (error: any) {
    console.error("Error adding preventive maintenance record to Firestore:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error:", error.issues);
      throw new Error(`Validation failed: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
  }
}

export async function updateMaintenanceRecord(
  recordId: string,
  equipmentId: string,
  dataToUpdate: Partial<Omit<MaintenanceRecord, 'id' | 'equipmentId'>>
): Promise<MaintenanceRecord> {
  try {
    const recordRef = doc(db, 'maintenanceRecords', recordId);
    
    const validatedData = UpdateMaintenanceRecordInputSchema.parse(dataToUpdate);
    
    await updateDoc(recordRef, validatedData);

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
        lastMaintenanceDate: null, 
        nextMaintenanceDate: null,
        lastTechnician: null
      });
    }
    
    const updatedRecordSnap = await getDoc(recordRef);
    if (!updatedRecordSnap.exists()) throw new Error("Failed to retrieve updated preventive maintenance record");
    
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...updatedRecordSnap.data(), id: updatedRecordSnap.id }) as MaintenanceRecord;
  } catch (error: any) {
    console.error("Error updating preventive maintenance record:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error:", error.issues);
      throw new Error(`Validation failed: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
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
        lastMaintenanceDate: null, 
        nextMaintenanceDate: null, 
        lastTechnician: null
      });
    }
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting preventive maintenance record from Firestore:", error);
    throw error;
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
    throw error;
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
    throw error;
  }
}

export async function deleteCorrectiveMaintenanceRecord(recordId: string, equipmentId: string): Promise<void> {
  try {
    const recordRef = doc(db, 'correctiveMaintenanceRecords', recordId);
    await deleteDoc(recordRef);
    
    revalidatePath(`/equipment/${equipmentId}`);
  } catch (error) {
    console.error("Error deleting corrective maintenance record from Firestore:", error);
    throw error;
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
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        lastTechnician: null,
    };
    
    await setDoc(equipmentRef, dataToSave);
    
    revalidatePath('/');
    return { ...dataToSave } as Equipment; 

  } catch (error: any) {
    console.error("Error adding equipment to Firestore:", error);
    throw error;
  }
}

export async function updateEquipment(
  equipmentId: string,
  dataToUpdate: Partial<Omit<Equipment, 'id'>>
): Promise<Equipment> {
  try {
    const equipmentRef = doc(db, 'equipments', equipmentId);

    const processedData: { [key: string]: any } = { ...dataToUpdate };
    if (processedData.lastMaintenanceDate === '') {
      processedData.lastMaintenanceDate = null; 
    }
    if (processedData.nextMaintenanceDate === '') {
      processedData.nextMaintenanceDate = null; 
    }
    if (processedData.lastTechnician === '') {
      processedData.lastTechnician = null;
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
    throw error;
  }
}

// --- Chart Data Actions ---
export async function getMaintenanceCountsByMonth() {
  try {
    const preventiveCol = collection(db, 'maintenanceRecords');
    const correctiveCol = collection(db, 'correctiveMaintenanceRecords');

    const [preventiveSnapshot, correctiveSnapshot] = await Promise.all([
      getDocs(preventiveCol),
      getDocs(correctiveCol)
    ]);

    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    
    const counts = monthNames.map((name) => ({
      month: name.slice(0, 3),
      preventivos: 0,
      correctivos: 0,
    }));
    
    preventiveSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Safer date parsing
      if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const monthIndex = parseInt(data.date.substring(5, 7), 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            counts[monthIndex].preventivos += 1;
        }
      }
    });

    correctiveSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Safer date parsing
      if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const monthIndex = parseInt(data.date.substring(5, 7), 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            counts[monthIndex].correctivos += 1;
        }
      }
    });

    return counts;

  } catch (error) {
    console.error("Error fetching maintenance counts:", error);
    throw new Error("Failed to fetch maintenance counts for chart.");
  }
}

export async function getPeripheralMaintenanceCountsByMonth() {
  try {
    const recordsCol = collection(db, 'peripheralMaintenanceRecords');
    const recordsSnapshot = await getDocs(recordsCol);

    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    
    const counts = monthNames.map((name) => ({
      month: name.slice(0, 3),
      mantenimientos: 0,
    }));
    
    recordsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const monthIndex = parseInt(data.date.substring(5, 7), 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            counts[monthIndex].mantenimientos += 1;
        }
      }
    });

    return counts;

  } catch (error) {
    console.error("Error fetching peripheral maintenance counts:", error);
    throw new Error("Failed to fetch peripheral maintenance counts for chart.");
  }
}


// --- Ticket Actions ---
const TicketSchema = z.object({
  pcId: z.string(),
  pcName: z.string(),
  userName: z.string(),
  patrimonialId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  date: z.string(),
  assignedEngineer: z.string(),
  maintenanceType: z.enum(['Preventivo', 'Correctivo']),
  problemDescription: z.string(),
  actionsTaken: z.string(),
});

const UpdateTicketSchema = TicketSchema.extend({
  status: z.enum(['Abierto', 'En Proceso', 'Cerrado']),
});


export async function addTicket(ticketData: z.infer<typeof TicketSchema>) {
  try {
    const validatedData = TicketSchema.parse(ticketData);
    await addDoc(collection(db, 'tickets'), {
      ...validatedData,
      status: 'Abierto',
      createdAt: serverTimestamp(),
    });
    revalidatePath('/'); // Revalidate the home page to potentially show a success message or update a list of tickets
  } catch (error) {
    console.error("Error adding ticket to Firestore:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
  }
}

export async function getTickets(): Promise<Ticket[]> {
  try {
    const ticketsCol = collection(db, 'tickets');
    const q = query(ticketsCol, orderBy('createdAt', 'desc'));
    const ticketSnapshot = await getDocs(q);
    const ticketList = ticketSnapshot.docs.map(doc => {
      const data = doc.data();
      const convertedData = convertTimestampToISO(data);
      return {
        ...convertedData,
        id: doc.id,
      } as Ticket;
    });
    return ticketList;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error("Failed to fetch tickets.");
  }
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  try {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
      const data = ticketSnap.data();
      return convertTimestampToISO({ ...data, id: ticketSnap.id }) as Ticket;
    } else {
      console.log(`No such document with id: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    throw error;
  }
}

export async function updateTicket(
  ticketId: string,
  dataToUpdate: z.infer<typeof UpdateTicketSchema>
): Promise<void> {
  try {
    const validatedData = UpdateTicketSchema.parse(dataToUpdate);
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, validatedData);
    revalidatePath('/'); // Revalidate home page where tickets are listed
  } catch (error) {
    console.error("Error updating ticket in Firestore:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
  }
}

export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting ticket from Firestore:", error);
    throw new Error("Failed to delete ticket.");
  }
}

// --- Peripheral Actions ---

export async function getPeripherals(): Promise<Peripheral[]> {
  try {
    const peripheralsCol = collection(db, 'peripherals');
    const peripheralSnapshot = await getDocs(query(peripheralsCol, orderBy('id')));
    const peripheralList = peripheralSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestampToISO({ ...data, id: doc.id }) as Peripheral;
    });
    return peripheralList;
  } catch (error) {
    console.error("Error fetching peripherals:", error);
    throw error;
  }
}

export async function getPeripheralById(id: string): Promise<Peripheral | undefined> {
  try {
    const peripheralRef = doc(db, 'peripherals', id);
    const peripheralSnap = await getDoc(peripheralRef);

    if (peripheralSnap.exists()) {
      const data = peripheralSnap.data();
      return convertTimestampToISO({ ...data, id: peripheralSnap.id }) as Peripheral;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching peripheral by ID:", error);
    throw error;
  }
}

export async function addPeripheral(
  peripheralData: Omit<Peripheral, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'lastTechnician'>
): Promise<Peripheral> {
  try {
    const peripheralRef = doc(db, 'peripherals', peripheralData.id);
    const peripheralSnap = await getDoc(peripheralRef);

    if (peripheralSnap.exists()) {
      throw new Error(`El periférico con ID ${peripheralData.id} ya existe.`);
    }

    const dataToSave = {
        ...peripheralData,
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        lastTechnician: null,
    };
    
    await setDoc(peripheralRef, dataToSave);
    revalidatePath('/');
    return { ...dataToSave } as Peripheral;

  } catch (error: any) {
    console.error("Error adding peripheral to Firestore:", error);
    throw error;
  }
}

export async function updatePeripheral(
  peripheralId: string,
  dataToUpdate: Partial<Omit<Peripheral, 'id'>>
): Promise<Peripheral> {
  try {
    const peripheralRef = doc(db, 'peripherals', peripheralId);
    await updateDoc(peripheralRef, dataToUpdate);
    
    const updatedPeripheralSnap = await getDoc(peripheralRef);
    if (!updatedPeripheralSnap.exists()) throw new Error("Failed to retrieve updated peripheral");
    
    revalidatePath(`/peripherals/${peripheralId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...updatedPeripheralSnap.data(), id: updatedPeripheralSnap.id }) as Peripheral;
  } catch (error) {
    console.error("Error updating peripheral in Firestore:", error);
    throw error;
  }
}

// --- Peripheral Maintenance Records ---

export async function getPeripheralMaintenanceRecords(peripheralId: string): Promise<PeripheralMaintenanceRecord[]> {
    try {
      const recordsCol = collection(db, 'peripheralMaintenanceRecords');
      const q = query(recordsCol, where('peripheralId', '==', peripheralId));
      const recordSnapshot = await getDocs(q);
      const recordList = recordSnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestampToISO({ ...data, id: doc.id }) as PeripheralMaintenanceRecord;
      });
      return recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching peripheral maintenance records:", error);
      throw error;
    }
}

export async function getPeripheralMaintenanceRecordById(recordId: string): Promise<PeripheralMaintenanceRecord | undefined> {
  try {
    const recordRef = doc(db, 'peripheralMaintenanceRecords', recordId);
    const recordSnap = await getDoc(recordRef);

    if (recordSnap.exists()) {
      const data = recordSnap.data();
      return convertTimestampToISO({ ...data, id: recordSnap.id }) as PeripheralMaintenanceRecord;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching peripheral maintenance record by ID:", error);
    throw error;
  }
}

export async function addPeripheralMaintenanceRecord(
    recordData: Omit<PeripheralMaintenanceRecord, 'id'>
  ): Promise<PeripheralMaintenanceRecord> {
    try {
      const newRecordRef = await addDoc(collection(db, 'peripheralMaintenanceRecords'), {
        ...recordData,
        createdAt: serverTimestamp() 
      });
  
      const peripheralRef = doc(db, 'peripherals', recordData.peripheralId);
      const nextDate = new Date(recordData.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      
      await updateDoc(peripheralRef, {
        lastMaintenanceDate: recordData.date, 
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        lastTechnician: recordData.technician
      });
  
      const newRecordSnap = await getDoc(newRecordRef);
      if (!newRecordSnap.exists()) throw new Error("Failed to retrieve new peripheral maintenance record");
      
      revalidatePath(`/peripherals/${recordData.peripheralId}`);
      revalidatePath('/');
      return convertTimestampToISO({ ...newRecordSnap.data(), id: newRecordSnap.id }) as PeripheralMaintenanceRecord;
  
    } catch (error: any) {
      console.error("Error adding peripheral maintenance record to Firestore:", error);
      throw error;
    }
}

export async function updatePeripheralMaintenanceRecord(
  recordId: string,
  peripheralId: string,
  dataToUpdate: Partial<Omit<PeripheralMaintenanceRecord, 'id' | 'peripheralId'>>
): Promise<PeripheralMaintenanceRecord> {
  try {
    const recordRef = doc(db, 'peripheralMaintenanceRecords', recordId);
    await updateDoc(recordRef, dataToUpdate);

    const records = await getPeripheralMaintenanceRecords(peripheralId);
    const peripheralDocRef = doc(db, 'peripherals', peripheralId);

    if (records.length > 0) {
      const latestRecord = records[0]; 
      const nextDate = new Date(latestRecord.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      await updateDoc(peripheralDocRef, {
        lastMaintenanceDate: latestRecord.date,
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        lastTechnician: latestRecord.technician
      });
    } else {
       await updateDoc(peripheralDocRef, {
        lastMaintenanceDate: null, 
        nextMaintenanceDate: null,
        lastTechnician: null
      });
    }
    
    const updatedRecordSnap = await getDoc(recordRef);
    if (!updatedRecordSnap.exists()) throw new Error("Failed to retrieve updated peripheral maintenance record");
    
    revalidatePath(`/peripherals/${peripheralId}`);
    revalidatePath('/');
    return convertTimestampToISO({ ...updatedRecordSnap.data(), id: updatedRecordSnap.id }) as PeripheralMaintenanceRecord;
  } catch (error: any) {
    console.error("Error updating peripheral maintenance record:", error);
    throw error;
  }
}

export async function deletePeripheralMaintenanceRecord(recordId: string, peripheralId: string): Promise<void> {
  try {
    const recordRef = doc(db, 'peripheralMaintenanceRecords', recordId);
    await deleteDoc(recordRef);

    const records = await getPeripheralMaintenanceRecords(peripheralId);
    const peripheralDocRef = doc(db, 'peripherals', peripheralId);

    if (records.length > 0) {
      const latestRecord = records[0];
      const nextDate = new Date(latestRecord.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      await updateDoc(peripheralDocRef, {
        lastMaintenanceDate: latestRecord.date,
        nextMaintenanceDate: nextDate.toISOString().split('T')[0],
        lastTechnician: latestRecord.technician
      });
    } else {
      await updateDoc(peripheralDocRef, {
        lastMaintenanceDate: null, 
        nextMaintenanceDate: null, 
        lastTechnician: null
      });
    }
    revalidatePath(`/peripherals/${peripheralId}`);
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting peripheral maintenance record from Firestore:", error);
    throw error;
  }
}
