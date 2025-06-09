export type Equipment = {
  id: string; // Corresponds to ID CPU
  name: string; // Nombre CPU
  os: string; // Sistema Operativo
  lastMaintenanceDate?: string; // ISO date string, e.g., "2023-10-26"
  nextMaintenanceDate?: string; // ISO date string, e.g., "2024-04-26"
  type: string; // e.g., "CPU Desktop", "Laptop", for AI
  commonFailurePoints: string; // for AI, e.g., "PSU, HDD, RAM overheating"
  specifications: string; // General specs description, e.g., "Intel i5, 8GB RAM, 256GB SSD"
};

export type MaintenanceRecord = {
  id: string; // Unique ID for the record
  equipmentId: string;
  date: string; // ISO date string
  technician: string;
  description: string;
};
