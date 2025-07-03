
'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { addEquipment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Equipment } from '@/lib/types';

const equipmentSchema = z.object({
  // Información de PC
  id: z.string().min(1, "El ID del PC es requerido.").max(20, "El ID no debe exceder los 20 caracteres."),
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
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface AddEquipmentFormProps {
  onSuccess?: () => void;
}

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      id: '',
      name: '',
      os: '',
      type: '', // Para IA
      commonFailurePoints: '', // Para IA
      processor: '',
      ramAmount: '',
      ramType: '',
      storageCapacity: '',
      storageType: '',
      ipAddress: '',
      userName: '',
      pcPatrimonialId: '',
      mousePatrimonialId: '',
      mouseBrand: '',
      mouseModel: '',
      monitorPatrimonialId: '',
      monitorBrand: '',
      monitorModel: '',
      regulatorPatrimonialId: '',
      regulatorBrand: '',
      regulatorModel: '',
      keyboardPatrimonialId: '',
      keyboardBrand: '',
      keyboardModel: '',
      pcStatus: '',
      reusableParts: '',
    }
  });

  const onSubmit: SubmitHandler<EquipmentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newEquipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'specifications' | 'lastTechnician'> = data;
      await addEquipment(newEquipmentData);
      toast({
        title: "Equipo Agregado",
        description: `El equipo ${data.name} ha sido agregado exitosamente.`,
        variant: "default",
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error agregando equipo:", error);
      toast({
        title: "Error al Agregar Equipo",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar el equipo. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Agregar Nuevo Equipo</CardTitle>
        <CardDescription>Complete los detalles del nuevo equipo.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          {/* Sección Información de PC */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Información de PC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="equipment-id">ID PC <span className="text-destructive">*</span></Label>
                <Input id="equipment-id" placeholder="Ej: CPU004, LAP002" {...register('id')} />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-name">Nombre PC <span className="text-destructive">*</span></Label>
                <Input id="equipment-name" placeholder="Ej: Ventas-PC03" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-processor">Procesador</Label>
                <Input id="equipment-processor" placeholder="Ej: Intel Core i5-8500" {...register('processor')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-ramAmount">Memoria RAM</Label>
                <Input id="equipment-ramAmount" placeholder="Ej: 8GB, 16GB" {...register('ramAmount')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-ramType">Tipo de RAM</Label>
                <Input id="equipment-ramType" placeholder="Ej: DDR4, DDR5" {...register('ramType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-storageCapacity">Capacidad de Disco Duro</Label>
                <Input id="equipment-storageCapacity" placeholder="Ej: 256GB SSD, 1TB HDD" {...register('storageCapacity')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-storageType">Tipo de Disco Duro</Label>
                <Input id="equipment-storageType" placeholder="Ej: SSD, HDD, NVMe" {...register('storageType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-os">Sistema Operativo <span className="text-destructive">*</span></Label>
                <Input id="equipment-os" placeholder="Ej: Windows 11 Pro" {...register('os')} />
                {errors.os && <p className="text-sm text-destructive">{errors.os.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-ipAddress">IP de PC</Label>
                <Input id="equipment-ipAddress" placeholder="Ej: 192.168.1.100" {...register('ipAddress')} />
                {errors.ipAddress && <p className="text-sm text-destructive">{errors.ipAddress.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-type">Tipo de Equipo (para IA) <span className="text-destructive">*</span></Label>
                <Input id="equipment-type" placeholder="Ej: Desktop CPU, Laptop" {...register('type')} />
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="equipment-commonFailurePoints">Puntos Comunes de Falla (para IA) <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="equipment-commonFailurePoints" 
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
                <Label htmlFor="equipment-userName">Nombre de Usuario</Label>
                <Input id="equipment-userName" placeholder="Ej: Juan Pérez" {...register('userName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-pcPatrimonialId">No. Patrimonial de PC</Label>
                <Input id="equipment-pcPatrimonialId" placeholder="Ej: PAT-PC-001" {...register('pcPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-mousePatrimonialId">No. Patrimonial de Mouse</Label>
                <Input id="equipment-mousePatrimonialId" placeholder="Ej: PAT-MOUSE-001" {...register('mousePatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-mouseBrand">Marca de Mouse</Label>
                <Input id="equipment-mouseBrand" placeholder="Ej: Logitech" {...register('mouseBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-mouseModel">Modelo de Mouse</Label>
                <Input id="equipment-mouseModel" placeholder="Ej: M90" {...register('mouseModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-monitorPatrimonialId">No. Patrimonial Monitor</Label>
                <Input id="equipment-monitorPatrimonialId" placeholder="Ej: PAT-MON-001" {...register('monitorPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-monitorBrand">Marca de Monitor</Label>
                <Input id="equipment-monitorBrand" placeholder="Ej: Dell" {...register('monitorBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-monitorModel">Modelo de Monitor</Label>
                <Input id="equipment-monitorModel" placeholder="Ej: P2419H" {...register('monitorModel')} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="equipment-keyboardPatrimonialId">No. Patrimonial Teclado</Label>
                <Input id="equipment-keyboardPatrimonialId" placeholder="Ej: PAT-KEY-001" {...register('keyboardPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-keyboardBrand">Marca de Teclado</Label>
                <Input id="equipment-keyboardBrand" placeholder="Ej: Logitech" {...register('keyboardBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-keyboardModel">Modelo de Teclado</Label>
                <Input id="equipment-keyboardModel" placeholder="Ej: K120" {...register('keyboardModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-regulatorPatrimonialId">No. Patrimonial Regulador</Label>
                <Input id="equipment-regulatorPatrimonialId" placeholder="Ej: PAT-REG-001" {...register('regulatorPatrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-regulatorBrand">Marca Regulador</Label>
                <Input id="equipment-regulatorBrand" placeholder="Ej: APC" {...register('regulatorBrand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-regulatorModel">Modelo Regulador</Label>
                <Input id="equipment-regulatorModel" placeholder="Ej: Back-UPS 600VA" {...register('regulatorModel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-pcStatus">Condición de PC</Label>
                <Input id="equipment-pcStatus" placeholder="Ej: Operativo, En Reparación" {...register('pcStatus')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-reusableParts">¿Piezas reutilizables?</Label>
                <Input id="equipment-reusableParts" placeholder="Ej: Sí, No, Algunas" {...register('reusableParts')} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Guardando Equipo...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Guardar Equipo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
