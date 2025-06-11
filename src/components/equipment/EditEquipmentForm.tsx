
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { getEquipmentById, updateEquipment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Equipment } from '@/lib/types';
import { format, parseISO } from 'date-fns';

const equipmentFormSchema = z.object({
  // Información de PC
  name: z.string().min(1, "El nombre del PC es requerido.").max(50, "El nombre no debe exceder los 50 caracteres."),
  processor: z.string().optional(),
  ramAmount: z.string().optional(),
  ramType: z.string().optional(),
  storageCapacity: z.string().optional(),
  storageType: z.string().optional(),
  os: z.string().min(1, "El sistema operativo es requerido.").max(50, "El SO no debe exceder los 50 caracteres."),
  ipAddress: z.string().optional().refine(val => !val || /^(\d{1,3}\.){3}\d{1,3}$/.test(val) || val === '', {
    message: "Dirección IP inválida.",
  }),
  type: z.string().min(1, "El tipo de equipo es requerido.").max(50, "El tipo no debe exceder los 50 caracteres."), // Para IA
  commonFailurePoints: z.string().min(1, "Los puntos comunes de falla son requeridos.").max(200, "Puntos de falla no debe exceder 200 caracteres."), // Para IA
  
  // Información de Inventario
  userName: z.string().optional(),
  pcPatrimonialId: z.string().optional(),
  mousePatrimonialId: z.string().optional(),
  mouseBrand: z.string().optional(),
  mouseModel: z.string().optional(),
  monitorPatrimonialId: z.string().optional(),
  monitorBrand: z.string().optional(),
  monitorModel: z.string().optional(),
  regulatorPatrimonialId: z.string().optional(),
  regulatorBrand: z.string().optional(),
  regulatorModel: z.string().optional(),
  keyboardPatrimonialId: z.string().optional(),
  keyboardBrand: z.string().optional(),
  keyboardModel: z.string().optional(),
  pcStatus: z.string().optional(),
  reusableParts: z.string().optional(),

  // Fechas de Mantenimiento
  lastMaintenanceDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  nextMaintenanceDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EditEquipmentFormProps {
  equipmentId: string;
  onSuccess?: () => void;
}

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch (e) {
    console.warn("Invalid date string for input:", dateString);
    return ''; 
  }
};

export const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({ equipmentId, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [initialEquipmentName, setInitialEquipmentName] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
  });

  useEffect(() => {
    const fetchEquipmentData = async () => {
      setIsLoadingData(true);
      try {
        const equipment = await getEquipmentById(equipmentId);
        if (equipment) {
          setInitialEquipmentName(equipment.name);
          reset({
            name: equipment.name,
            os: equipment.os,
            type: equipment.type, // Para IA
            commonFailurePoints: equipment.commonFailurePoints, // Para IA
            processor: equipment.processor || '',
            ramAmount: equipment.ramAmount || '',
            ramType: equipment.ramType || '',
            storageCapacity: equipment.storageCapacity || '',
            storageType: equipment.storageType || '',
            ipAddress: equipment.ipAddress || '',
            userName: equipment.userName || '',
            pcPatrimonialId: equipment.pcPatrimonialId || '',
            mousePatrimonialId: equipment.mousePatrimonialId || '',
            mouseBrand: equipment.mouseBrand || '',
            mouseModel: equipment.mouseModel || '',
            monitorPatrimonialId: equipment.monitorPatrimonialId || '',
            monitorBrand: equipment.monitorBrand || '',
            monitorModel: equipment.monitorModel || '',
            regulatorPatrimonialId: equipment.regulatorPatrimonialId || '',
            regulatorBrand: equipment.regulatorBrand || '',
            regulatorModel: equipment.regulatorModel || '',
            keyboardPatrimonialId: equipment.keyboardPatrimonialId || '',
            keyboardBrand: equipment.keyboardBrand || '',
            keyboardModel: equipment.keyboardModel || '',
            pcStatus: equipment.pcStatus || '',
            reusableParts: equipment.reusableParts || '',
            lastMaintenanceDate: formatDateForInput(equipment.lastMaintenanceDate),
            nextMaintenanceDate: formatDateForInput(equipment.nextMaintenanceDate),
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del equipo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error al Cargar Datos",
          description: "Hubo un problema al obtener los detalles del equipo.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchEquipmentData();
  }, [equipmentId, reset, toast]);

  const onSubmit: SubmitHandler<EquipmentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Equipment> = {
        ...data,
        lastMaintenanceDate: data.lastMaintenanceDate || undefined,
        nextMaintenanceDate: data.nextMaintenanceDate || undefined,
      };
      await updateEquipment(equipmentId, payload);
      toast({
        title: "Equipo Actualizado",
        description: `El equipo ${data.name} ha sido actualizado exitosamente. (Simulado)`,
        variant: "default",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando equipo:", error);
      toast({
        title: "Error al Actualizar Equipo",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar los cambios. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Cargando Datos del Equipo...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 size={48} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Modificar Equipo: {initialEquipmentName}</CardTitle>
        <CardDescription>ID PC: {equipmentId} (No editable)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          {/* Sección Información de PC */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Información de PC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-name">Nombre PC <span className="text-destructive">*</span></Label>
                <Input id="edit-equipment-name" placeholder="Ej: Ventas-PC03" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-processor">Procesador</Label>
                <Input id="edit-equipment-processor" placeholder="Ej: Intel Core i5-8500" {...register('processor')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-ramAmount">Memoria RAM</Label>
                <Input id="edit-equipment-ramAmount" placeholder="Ej: 8GB, 16GB" {...register('ramAmount')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-ramType">Tipo de RAM</Label>
                <Input id="edit-equipment-ramType" placeholder="Ej: DDR4, DDR5" {...register('ramType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-storageCapacity">Capacidad de Disco Duro</Label>
                <Input id="edit-equipment-storageCapacity" placeholder="Ej: 256GB SSD, 1TB HDD" {...register('storageCapacity')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-storageType">Tipo de Disco Duro</Label>
                <Input id="edit-equipment-storageType" placeholder="Ej: SSD, HDD, NVMe" {...register('storageType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-os">Sistema Operativo <span className="text-destructive">*</span></Label>
                <Input id="edit-equipment-os" placeholder="Ej: Windows 11 Pro" {...register('os')} />
                {errors.os && <p className="text-sm text-destructive">{errors.os.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-ipAddress">IP de PC</Label>
                <Input id="edit-equipment-ipAddress" placeholder="Ej: 192.168.1.100" {...register('ipAddress')} />
                {errors.ipAddress && <p className="text-sm text-destructive">{errors.ipAddress.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-type">Tipo de Equipo (para IA) <span className="text-destructive">*</span></Label>
                <Input id="edit-equipment-type" placeholder="Ej: Desktop CPU, Laptop" {...register('type')} />
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-equipment-commonFailurePoints">Puntos Comunes de Falla (para IA) <span className="text-destructive">*</span></Label>
              <Textarea 
                id="edit-equipment-commonFailurePoints" 
                rows={3} 
                placeholder="Ej: Fuente de poder, sobrecalentamiento por polvo" 
                {...register('commonFailurePoints')} 
              />
              {errors.commonFailurePoints && <p className="text-sm text-destructive">{errors.commonFailurePoints.message}</p>}
            </div>
          </div>

          {/* Sección Información de Inventario */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Información de Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-userName">Nombre de Usuario</Label>
                <Input id="edit-equipment-userName" placeholder="Ej: Juan Pérez" {...register('userName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-pcPatrimonialId">No. Patrimonial de PC</Label>
                <Input id="edit-equipment-pcPatrimonialId" placeholder="Ej: PAT-PC-001" {...register('pcPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-mousePatrimonialId">No. Patrimonial de Mouse</Label>
                <Input id="edit-equipment-mousePatrimonialId" placeholder="Ej: PAT-MOUSE-001" {...register('mousePatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-mouseBrand">Marca de Mouse</Label>
                <Input id="edit-equipment-mouseBrand" placeholder="Ej: Logitech" {...register('mouseBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-mouseModel">Modelo de Mouse</Label>
                <Input id="edit-equipment-mouseModel" placeholder="Ej: M90" {...register('mouseModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-monitorPatrimonialId">No. Patrimonial Monitor</Label>
                <Input id="edit-equipment-monitorPatrimonialId" placeholder="Ej: PAT-MON-001" {...register('monitorPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-monitorBrand">Marca de Monitor</Label>
                <Input id="edit-equipment-monitorBrand" placeholder="Ej: Dell" {...register('monitorBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-monitorModel">Modelo de Monitor</Label>
                <Input id="edit-equipment-monitorModel" placeholder="Ej: P2419H" {...register('monitorModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-keyboardPatrimonialId">No. Patrimonial Teclado</Label>
                <Input id="edit-equipment-keyboardPatrimonialId" placeholder="Ej: PAT-KEY-001" {...register('keyboardPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-keyboardBrand">Marca de Teclado</Label>
                <Input id="edit-equipment-keyboardBrand" placeholder="Ej: Logitech" {...register('keyboardBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-keyboardModel">Modelo de Teclado</Label>
                <Input id="edit-equipment-keyboardModel" placeholder="Ej: K120" {...register('keyboardModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-regulatorPatrimonialId">No. Patrimonial Regulador</Label>
                <Input id="edit-equipment-regulatorPatrimonialId" placeholder="Ej: PAT-REG-001" {...register('regulatorPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-regulatorBrand">Marca Regulador</Label>
                <Input id="edit-equipment-regulatorBrand" placeholder="Ej: APC" {...register('regulatorBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-regulatorModel">Modelo Regulador</Label>
                <Input id="edit-equipment-regulatorModel" placeholder="Ej: Back-UPS 600VA" {...register('regulatorModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-pcStatus">Estado de PC</Label>
                <Input id="edit-equipment-pcStatus" placeholder="Ej: Operativo, En Reparación" {...register('pcStatus')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-reusableParts">¿Piezas reutilizables?</Label>
                <Input id="edit-equipment-reusableParts" placeholder="Ej: Sí, No, Algunas" {...register('reusableParts')} />
              </div>
            </div>
          </div>

          {/* Sección Fechas de Mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Fechas de Mantenimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-lastMaintenanceDate">Último Mantenimiento</Label>
                <Input id="edit-equipment-lastMaintenanceDate" type="date" {...register('lastMaintenanceDate')} />
                {errors.lastMaintenanceDate && <p className="text-sm text-destructive">{errors.lastMaintenanceDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment-nextMaintenanceDate">Próximo Mantenimiento</Label>
                <Input id="edit-equipment-nextMaintenanceDate" type="date" {...register('nextMaintenanceDate')} />
                {errors.nextMaintenanceDate && <p className="text-sm text-destructive">{errors.nextMaintenanceDate.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isLoadingData} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Guardando Cambios...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
