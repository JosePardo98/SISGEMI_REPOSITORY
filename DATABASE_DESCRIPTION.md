# Descripción de la Base de Datos de SISGEMI

Este documento describe la estructura y el funcionamiento de la base de datos utilizada en la aplicación SISGEMI, que está implementada en **Firestore**, una base de datos NoSQL basada en documentos.

## Modelo de Datos General

La base de datos está organizada en colecciones. Cada colección contiene un conjunto de documentos, y cada documento representa un objeto de datos con sus respectivos campos. Las colecciones principales y sus relaciones son las siguientes:

---

### 1. Colección: `equipments`

-   **Propósito:** Almacena la información detallada de cada equipo de cómputo principal (PCs de escritorio, laptops). Es la entidad central del sistema.
-   **ID del Documento:** Se utiliza un ID único y legible asignado por el usuario (ej. `CPU001`, `LAP-VENTAS-02`).

#### Campos del Documento:

-   `id` (string): El identificador único del equipo (coincide con el ID del documento).
-   `name` (string): Nombre descriptivo del equipo (ej. "PC-PRODUCCION-05").
-   `os` (string): Sistema operativo instalado (ej. "Windows 11 Pro").
-   `userName` (string): Nombre del usuario principal asignado al equipo.
-   `location` (string): Ubicación física del equipo (ej. "Oficina de Finanzas").
-   `lastMaintenanceDate` (string, `YYYY-MM-DD` | null): Fecha del último **mantenimiento preventivo** registrado. Se actualiza automáticamente al agregar un nuevo registro de mantenimiento.
-   `nextMaintenanceDate` (string, `YYYY-MM-DD` | null): Fecha sugerida para el próximo mantenimiento preventivo (generalmente 6 meses después del último).
-   `lastTechnician` (string | null): Nombre del técnico que realizó el último mantenimiento preventivo.
-   **Campos de Especificaciones Técnicas (Opcionales):**
    -   `processor`, `ramAmount`, `ramType`, `storageCapacity`, `storageType`, `ipAddress`.
-   **Campos para Inteligencia Artificial:**
    -   `type` (string): Tipo de equipo para la IA (ej. "Desktop CPU", "Laptop Gamer").
    -   `commonFailurePoints` (string): Descripción de las fallas más comunes para este tipo de equipo.
-   **Campos de Inventario (Opcionales):**
    -   `pcPatrimonialId`, `mousePatrimonialId`, `monitorPatrimonialId`, `keyboardPatrimonialId`, `regulatorPatrimonialId`, y sus respectivas marcas y modelos.
    -   `pcStatus` (string): Condición actual (ej. "Operativo", "En Reparación").
    -   `reusableParts` (string): Indicador sobre si tiene piezas reutilizables.

---

### 2. Colección: `maintenanceRecords`

-   **Propósito:** Almacena el historial de todos los **mantenimientos preventivos** realizados a los equipos de la colección `equipments`.
-   **ID del Documento:** Autogenerado por Firestore.

#### Campos del Documento:

-   `equipmentId` (string): El ID del equipo al que pertenece este registro. **(Relación con `equipments`)**.
-   `date` (string, `YYYY-MM-DD`): Fecha en que se realizó el mantenimiento.
-   `technician` (string): Nombre del o los técnicos que realizaron el trabajo.
-   `description` (string): Descripción detallada de las tareas realizadas.
-   `createdAt` (Timestamp): Fecha y hora de creación del documento en la base de datos.

---

### 3. Colección: `correctiveMaintenanceRecords`

-   **Propósito:** Similar a `maintenanceRecords`, pero específicamente para **mantenimientos correctivos** (reparaciones).
-   **ID del Documento:** Autogenerado por Firestore.

#### Campos del Documento:

-   `equipmentId` (string): El ID del equipo reparado. **(Relación con `equipments`)**.
-   `date` (string, `YYYY-MM-DD`): Fecha de la intervención.
-   `technician` (string): Técnico que realizó la reparación.
-   `description` (string): Descripción de la falla reportada y la solución aplicada.
-   `createdAt` (Timestamp): Fecha y hora de creación del documento.

---

### 4. Colección: `peripherals`

-   **Propósito:** Almacena información sobre dispositivos periféricos como impresoras, scanners, proyectores, etc.
-   **ID del Documento:** ID único y legible asignado por el usuario (ej. `IMP-RH-01`).

#### Campos del Documento:

-   `id` (string): Identificador único del periférico.
-   `type` (string): Tipo de periférico (ej. "Impresora Láser", "Scanner de Cama Plana").
-   `location` (string): Ubicación física.
-   `lastMaintenanceDate` (string | null): Fecha del último mantenimiento.
-   `nextMaintenanceDate` (string | null): Fecha sugerida para el próximo mantenimiento.
-   `lastTechnician` (string | null): Técnico del último mantenimiento.
-   **Campos de Inventario (Opcionales):**
    -   `patrimonialId`, `brand`, `model`, `status`.
-   **Campo para IA:**
    -   `commonFailurePoints` (string): Fallas comunes para este tipo de periférico.

---

### 5. Colección: `peripheralMaintenanceRecords`

-   **Propósito:** Almacena el historial de mantenimientos (tanto preventivos como correctivos) realizados a los periféricos.
-   **ID del Documento:** Autogenerado por Firestore.

#### Campos del Documento:

-   `peripheralId` (string): ID del periférico relacionado. **(Relación con `peripherals`)**.
-   `date` (string, `YYYY-MM-DD`): Fecha del mantenimiento.
-   `technician` (string): Nombre del técnico.
-   `description` (string): Descripción de las tareas.
-   `type` (string): "Preventivo" o "Correctivo".
-   `createdAt` (Timestamp): Fecha y hora de creación.

---

### 6. Colección: `tickets`

-   **Propósito:** Gestiona las solicitudes de soporte o mantenimiento, funcionando como una "orden de trabajo" digital.
-   **ID del Documento:** Autogenerado por Firestore.

#### Campos del Documento:

-   `pcId` (string): ID del equipo que requiere soporte. **(Relación con `equipments`)**.
-   `pcName` (string): Nombre del equipo (para referencia rápida).
-   `userName` (string): Usuario que reporta el problema.
-   `date` (string, `YYYY-MM-DD`): Fecha de creación del ticket.
-   `assignedEngineer` (string): Ingeniero asignado para resolver el ticket.
-   `maintenanceType` (string): "Preventivo" o "Correctivo".
-   `problemDescription` (string): Descripción del problema reportado.
-   `actionsTaken` (string): Acciones realizadas para solucionar el problema.
-   `status` (string): Estado actual del ticket ("Abierto", "En Proceso", "Cerrado").
-   `createdAt` (Timestamp): Fecha y hora de creación del documento para ordenamiento.
-   **Campos de referencia (Opcionales):**
    -   `patrimonialId`, `brand`, `model`.
