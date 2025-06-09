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
  return mockMaintenanceRecords.filter(record => record.equipmentId === equipmentId);
}

export async function addMaintenanceRecord(
  recordData: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  await delay(500);
  const newRecord: MaintenanceRecord = {
    ...recordData,
    id: `MAINT${String(mockMaintenanceRecords.length + 1).padStart(3, '0')}`,
  };
  // In a real app, you would save this to a database.
  // For now, we can log it or push to mock array (won't persist across requests without more setup)
  console.log('New maintenance record (mock add):', newRecord);
  // mockMaintenanceRecords.push(newRecord); // This would modify server-side state, not ideal for simple mock.
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
