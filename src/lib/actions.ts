'use server';

import { mockEquipments, mockMaintenanceRecords } from '@/data/mockData';
import type { Equipment, MaintenanceRecord } from './types';
import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getEquipments(): Promise<Equipment[]> {
  await delay(300);
  return mockEquipments;
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  await delay(200);
  return mockEquipments.find(eq => eq.id === id);
}

export async function getMaintenanceRecordsForEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  await delay(250);
  // Return a copy to avoid direct mutation issues if any component tries to sort/modify the received array directly.
  // And ensure records are sorted by date, most recent first, for consistency.
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
    // Ensure new IDs are unique even if length changes due to other reasons (though not an issue here)
    // A slightly more robust way for mock data could be to use a timestamp or a larger random number
    // But for this simple mock, current length based ID is acceptable.
    id: `MAINT${String(mockMaintenanceRecords.length + 1 + Math.floor(Math.random()*1000)).padStart(3, '0')}`,
  };
  // Add the new record to the mock data array
  mockMaintenanceRecords.push(newRecord);
  console.log('New maintenance record added (mock):', newRecord);
  console.log('Current maintenance records count:', mockMaintenanceRecords.length);
  return newRecord;
}

export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  // In a real scenario, ensure proper error handling for the AI call.
  try {
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    // Return a default or error structure
    return { suggestedProcedures: "Error al obtener sugerencias. Intente más tarde." };
  }
}
