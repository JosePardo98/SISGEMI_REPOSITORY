
'use server';

import { mockEquipments, mockMaintenanceRecords } from '@/data/mockData';
import type { Equipment, MaintenanceRecord } from './types';
import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getEquipments(): Promise<Equipment[]> {
  await delay(300);
  return [...mockEquipments].sort((a, b) => a.id.localeCompare(b.id)); // Return a copy, sorted by ID
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  await delay(200);
  const equipment = mockEquipments.find(eq => eq.id === id);
  return equipment ? {...equipment} : undefined; // Return a copy
}

export async function getMaintenanceRecordsForEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  await delay(250);
  return mockMaintenanceRecords
    .filter(record => record.equipmentId === equipmentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addMaintenanceRecord(
  recordData: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  await delay(500);
  const newRecord: MaintenanceRecord = {
    ...recordData,
    id: `MAINT${String(mockMaintenanceRecords.length + 1 + Math.floor(Math.random()*1000)).padStart(3, '0')}`,
  };
  mockMaintenanceRecords.push(newRecord);
  
  // Update equipment's lastMaintenanceDate and suggest next one
  const equipmentIndex = mockEquipments.findIndex(eq => eq.id === recordData.equipmentId);
  if (equipmentIndex !== -1) {
    mockEquipments[equipmentIndex].lastMaintenanceDate = recordData.date;
    // Suggest next maintenance in 6 months
    const nextDate = new Date(recordData.date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    mockEquipments[equipmentIndex].nextMaintenanceDate = nextDate.toISOString().split('T')[0];
  }

  console.log('New maintenance record added (mock):', newRecord);
  return {...newRecord}; // Return a copy
}

export async function addEquipment(
  equipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate'>
): Promise<Equipment> {
  await delay(400);
  
  if (mockEquipments.some(eq => eq.id === equipmentData.id)) {
    throw new Error(`El equipo con ID ${equipmentData.id} ya existe.`);
  }

  const newEquipment: Equipment = {
    ...equipmentData,
    // lastMaintenanceDate and nextMaintenanceDate will be undefined for new equipment
    // or set them based on some default logic if needed
  };
  mockEquipments.push(newEquipment);
  console.log('New equipment added (mock):', newEquipment);
  return {...newEquipment}; // Return a copy
}

export async function updateEquipment(
  equipmentId: string,
  dataToUpdate: Partial<Omit<Equipment, 'id'>>
): Promise<Equipment> {
  await delay(400);
  const equipmentIndex = mockEquipments.findIndex(eq => eq.id === equipmentId);

  if (equipmentIndex === -1) {
    throw new Error(`Equipo con ID ${equipmentId} no encontrado.`);
  }

  // Ensure dates are either valid ISO date strings or undefined
  const processedData = { ...dataToUpdate };
  if (processedData.lastMaintenanceDate === '') {
    processedData.lastMaintenanceDate = undefined;
  }
  if (processedData.nextMaintenanceDate === '') {
    processedData.nextMaintenanceDate = undefined;
  }
  
  mockEquipments[equipmentIndex] = {
    ...mockEquipments[equipmentIndex],
    ...processedData,
  };
  
  console.log('Equipment updated (mock):', mockEquipments[equipmentIndex]);
  return {...mockEquipments[equipmentIndex]}; // Return a copy
}


export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  try {
    // Simulate delay for AI processing
    await delay(1500); 
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    // Consider providing a more user-friendly error or specific suggestions based on common cases
    return { suggestedProcedures: "Error al obtener sugerencias de IA. Verifique la conexión o inténtelo más tarde." };
  }
}
