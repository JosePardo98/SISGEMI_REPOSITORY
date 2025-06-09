import type { Equipment, MaintenanceRecord } from '@/lib/types';

export const mockEquipments: Equipment[] = [
  {
    id: 'CPU001',
    name: 'Contabilidad-PC01',
    os: 'Windows 10 Pro',
    lastMaintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-07-15',
    type: 'Desktop CPU',
    commonFailurePoints: 'Fuente de poder, Disco Duro, Sobrecalentamiento por polvo',
    specifications: 'Intel Core i5-8500, 8GB RAM, 256GB SSD + 1TB HDD',
  },
  {
    id: 'CPU002',
    name: 'Diseño-PC01',
    os: 'Windows 11 Pro',
    lastMaintenanceDate: '2023-11-20',
    nextMaintenanceDate: '2024-05-20',
    type: 'Workstation CPU',
    commonFailurePoints: 'Tarjeta gráfica, Sobrecalentamiento, Errores de memoria RAM',
    specifications: 'Intel Core i7-12700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 3060',
  },
  {
    id: 'CPU003',
    name: 'Recepción-PC',
    os: 'Windows 10 Home',
    lastMaintenanceDate: '2024-03-01',
    nextMaintenanceDate: '2024-09-01',
    type: 'Desktop CPU',
    commonFailurePoints: 'Sobrecalentamiento por polvo, fallos de inicio lentos',
    specifications: 'AMD Ryzen 3 3200G, 8GB RAM, 128GB SSD',
  },
  {
    id: 'LAP001',
    name: 'Gerencia-Laptop',
    os: 'macOS Sonoma',
    type: 'Laptop',
    commonFailurePoints: 'Batería, Teclado, Sobrecalentamiento',
    specifications: 'MacBook Pro 14", M2 Pro, 16GB RAM, 512GB SSD',
    lastMaintenanceDate: '2024-02-10',
    nextMaintenanceDate: '2024-08-10',
  },
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'MAINT001',
    equipmentId: 'CPU001',
    date: '2024-01-15',
    technician: 'Ana López',
    description: 'Limpieza interna de componentes, revisión de ventiladores, actualización de antivirus.',
  },
  {
    id: 'MAINT002',
    equipmentId: 'CPU001',
    date: '2023-07-10',
    technician: 'Ana López',
    description: 'Formateo y reinstalación de SO, backup de datos.',
  },
  {
    id: 'MAINT003',
    equipmentId: 'CPU002',
    date: '2023-11-20',
    technician: 'Carlos Ruiz',
    description: 'Limpieza de tarjeta gráfica, cambio de pasta térmica CPU, test de estrés.',
  },
  {
    id: 'MAINT004',
    equipmentId: 'CPU003',
    date: '2024-03-01',
    technician: 'Sofía Martin',
    description: 'Limpieza general, optimización de inicio, escaneo de malware.',
  },
  {
    id: 'MAINT005',
    equipmentId: 'LAP001',
    date: '2024-02-10',
    technician: 'Miguel Chan',
    description: 'Limpieza de teclado y pantalla, revisión de estado de batería, actualización de macOS.',
  },
];
