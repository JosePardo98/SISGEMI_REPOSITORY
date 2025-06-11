
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
  
  const equipmentIndex = mockEquipments.findIndex(eq => eq.id === recordData.equipmentId);
  if (equipmentIndex !== -1) {
    mockEquipments[equipmentIndex].lastMaintenanceDate = recordData.date;
    const nextDate = new Date(recordData.date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    mockEquipments[equipmentIndex].nextMaintenanceDate = nextDate.toISOString().split('T')[0];
  }

  console.log('New maintenance record added (mock):', newRecord);
  return {...newRecord}; 
}

export async function addEquipment(
  // Incluye todos los campos de Equipment excepto las fechas de mantenimiento y el 'specifications' obsoleto
  equipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'specifications'>
): Promise<Equipment> {
  await delay(400);
  
  if (mockEquipments.some(eq => eq.id === equipmentData.id)) {
    throw new Error(`El equipo con ID ${equipmentData.id} ya existe.`);
  }

  const newEquipment: Equipment = {
    ...equipmentData,
    // las fechas de mantenimiento se establecen a través de addMaintenanceRecord
    // o se pueden dejar undefined aquí.
  };
  mockEquipments.push(newEquipment);
  console.log('New equipment added (mock):', newEquipment);
  return {...newEquipment};
}

export async function updateEquipment(
  equipmentId: string,
  dataToUpdate: Partial<Omit<Equipment, 'id'>> // 'id' no se puede actualizar
): Promise<Equipment> {
  await delay(400);
  const equipmentIndex = mockEquipments.findIndex(eq => eq.id === equipmentId);

  if (equipmentIndex === -1) {
    throw new Error(`Equipo con ID ${equipmentId} no encontrado.`);
  }

  const processedData = { ...dataToUpdate };
  if (processedData.lastMaintenanceDate === '') {
    processedData.lastMaintenanceDate = undefined;
  }
  if (processedData.nextMaintenanceDate === '') {
    processedData.nextMaintenanceDate = undefined;
  }
  
  // Eliminar 'specifications' si se envía vacío, ya que es un campo obsoleto
  if ('specifications' in processedData && processedData.specifications === '') {
    delete processedData.specifications;
  }
  
  mockEquipments[equipmentIndex] = {
    ...mockEquipments[equipmentIndex],
    ...processedData,
  };
  
  console.log('Equipment updated (mock):', mockEquipments[equipmentIndex]);
  return {...mockEquipments[equipmentIndex]}; 
}


export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  try {
    await delay(1500); 
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    return { suggestedProcedures: "Error al obtener sugerencias de IA. Verifique la conexión o inténtelo más tarde." };
  }
}
