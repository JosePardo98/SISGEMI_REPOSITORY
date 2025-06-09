
'use server';

import { mockEquipments, mockMaintenanceRecords } from '@/data/mockData';
import type { Equipment, MaintenanceRecord } from './types';
import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getEquipments(): Promise<Equipment[]> {
  await delay(300);
  return [...mockEquipments]; // Return a copy
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  await delay(200);
  return mockEquipments.find(eq => eq.id === id);
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
  console.log('New maintenance record added (mock):', newRecord);
  return newRecord;
}

export async function addEquipment(
  equipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate'>
): Promise<Equipment> {
  await delay(400);
  
  // Basic check for duplicate ID in mock data
  if (mockEquipments.some(eq => eq.id === equipmentData.id)) {
    throw new Error(`El equipo con ID ${equipmentData.id} ya existe.`);
  }

  const newEquipment: Equipment = {
    ...equipmentData,
    // lastMaintenanceDate and nextMaintenanceDate will be undefined for new equipment
  };
  mockEquipments.push(newEquipment);
  console.log('New equipment added (mock):', newEquipment);
  return newEquipment;
}


export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  try {
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    return { suggestedProcedures: "Error al obtener sugerencias. Intente más tarde." };
  }
}
