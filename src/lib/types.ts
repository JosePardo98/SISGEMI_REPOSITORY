export type Equipment = {
  id: string; // Corresponds to ID PC
  name: string; // Nombre PC
  os: string; // Sistema Operativo
  lastMaintenanceDate?: string; // ISO date string, e.g., "2023-10-26"
  lastTechnician?: string; // Technician from the last maintenance
  nextMaintenanceDate?: string; // ISO date string, e.g., "2024-04-26"
  
  // Información de PC
  processor?: string;
  ramAmount?: string; // e.g., "8GB", "16GB"
  ramType?: string; // e.g., "DDR4", "DDR5"
  storageCapacity?: string; // e.g., "256GB SSD", "1TB HDD"
  storageType?: string; // e.g., "SSD", "HDD", "NVMe"
  ipAddress?: string;
  type: string; // e.g., "CPU Desktop", "Laptop", for AI - Mantenido para IA
  commonFailurePoints: string; // for AI, e.g., "PSU, HDD, RAM overheating" - Mantenido para IA
  specifications?: string; // General specs description - Puede ser obsoleto con campos granulares

  // Información de Inventario
  userName?: string;
  pcPatrimonialId?: string;
  mousePatrimonialId?: string;
  mouseBrand?: string;
  mouseModel?: string;
  monitorPatrimonialId?: string;
  monitorBrand?: string;
  monitorModel?: string;
  regulatorPatrimonialId?: string; 
  regulatorBrand?: string;
  regulatorModel?: string;
  keyboardPatrimonialId?: string;
  keyboardBrand?: string;
  keyboardModel?: string;
  pcStatus?: string; // (e.g., "Operativo", "En Reparación", "Obsoleto")
  reusableParts?: string; // (e.g., "Sí", "No", "Algunas")
};

export type MaintenanceRecord = {
  id: string; // Unique ID for the record
  equipmentId: string;
  date: string; // ISO date string
  technician: string;
  description: string;
};
