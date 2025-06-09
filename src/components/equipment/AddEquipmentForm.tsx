
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
  id: z.string().min(1, "El ID del PC es requerido.").max(20, "El ID no debe exceder los 20 caracteres."),
  name: z.string().min(1, "El nombre del PC es requerido.").max(50, "El nombre no debe exceder los 50 caracteres."),
  os: z.string().min(1, "El sistema operativo es requerido.").max(50, "El SO no debe exceder los 50 caracteres."),
  type: z.string().min(1, "El tipo de equipo es requerido.").max(50, "El tipo no debe exceder los 50 caracteres."),
  commonFailurePoints: z.string().min(1, "Los puntos comunes de falla son requeridos.").max(200, "Puntos de falla no debe exceder 200 caracteres."),
  specifications: z.string().min(1, "Las especificaciones son requeridas.").max(300, "Especificaciones no debe exceder 300 caracteres."),
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
      type: '',
      commonFailurePoints: '',
      specifications: '',
    }
  });

  const onSubmit: SubmitHandler<EquipmentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newEquipmentData: Omit<Equipment, 'lastMaintenanceDate' | 'nextMaintenanceDate'> = data;
      await addEquipment(newEquipmentData);
      toast({
        title: "Equipo Agregado",
        description: `El equipo ${data.name} ha sido agregado exitosamente. (Simulado)`,
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="equipment-id">ID PC</Label>
              <Input id="equipment-id" placeholder="Ej: CPU004, LAP002" {...register('id')} />
              {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-name">Nombre PC</Label>
              <Input id="equipment-name" placeholder="Ej: Ventas-PC03" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="equipment-os">Sistema Operativo</Label>
              <Input id="equipment-os" placeholder="Ej: Windows 11 Pro" {...register('os')} />
              {errors.os && <p className="text-sm text-destructive">{errors.os.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-type">Tipo de Equipo</Label>
              <Input id="equipment-type" placeholder="Ej: Desktop CPU, Laptop, Servidor" {...register('type')} />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="equipment-specifications">Especificaciones</Label>
            <Textarea 
              id="equipment-specifications" 
              rows={3} 
              placeholder="Ej: Intel Core i3, 4GB RAM, 128GB SSD" 
              {...register('specifications')} 
            />
            {errors.specifications && <p className="text-sm text-destructive">{errors.specifications.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-commonFailurePoints">Puntos Comunes de Falla</Label>
            <Textarea 
              id="equipment-commonFailurePoints" 
              rows={3} 
              placeholder="Ej: Fuente de poder, sobrecalentamiento por polvo" 
              {...register('commonFailurePoints')} 
            />
            {errors.commonFailurePoints && <p className="text-sm text-destructive">{errors.commonFailurePoints.message}</p>}
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
