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
import { addPeripheral } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Peripheral } from '@/lib/types';

const peripheralSchema = z.object({
  id: z.string().min(1, "El ID del periférico es requerido.").max(20, "El ID no debe exceder los 20 caracteres."),
  name: z.string().min(1, "El nombre del periférico es requerido.").max(50, "El nombre no debe exceder los 50 caracteres."),
  type: z.string().min(1, "El tipo de periférico es requerido.").max(50, "El tipo no debe exceder los 50 caracteres."),
  patrimonialId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  commonFailurePoints: z.string().min(1, "Los puntos comunes de falla son requeridos.").max(200, "Puntos de falla no debe exceder 200 caracteres."),
});

type PeripheralFormData = z.infer<typeof peripheralSchema>;

interface AddPeripheralFormProps {
  onSuccess?: () => void;
}

export const AddPeripheralForm: React.FC<AddPeripheralFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PeripheralFormData>({
    resolver: zodResolver(peripheralSchema),
    defaultValues: {
      id: '',
      name: '',
      type: '',
      commonFailurePoints: '',
      patrimonialId: '',
      brand: '',
      model: '',
      location: '',
      status: 'Operativo',
    }
  });

  const onSubmit: SubmitHandler<PeripheralFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newPeripheralData: Omit<Peripheral, 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'lastTechnician'> = data;
      await addPeripheral(newPeripheralData);
      toast({
        title: "Periférico Agregado",
        description: `El periférico ${data.name} ha sido agregado exitosamente.`,
        variant: "default",
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error agregando periférico:", error);
      toast({
        title: "Error al Agregar Periférico",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar el periférico. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Agregar Nuevo Periférico</CardTitle>
        <CardDescription>Complete los detalles del nuevo periférico (impresora, scanner, etc.).</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="peripheral-id">ID Periférico <span className="text-destructive">*</span></Label>
              <Input id="peripheral-id" placeholder="Ej: IMP001, SCAN02" {...register('id')} />
              {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-name">Nombre Periférico <span className="text-destructive">*</span></Label>
              <Input id="peripheral-name" placeholder="Ej: Impresora Almacén" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-type">Tipo (para IA) <span className="text-destructive">*</span></Label>
              <Input id="peripheral-type" placeholder="Ej: Impresora Láser, Scanner de Cama Plana" {...register('type')} />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-location">Ubicación</Label>
              <Input id="peripheral-location" placeholder="Ej: Oficina de Contabilidad" {...register('location')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-patrimonialId">No. Patrimonial</Label>
              <Input id="peripheral-patrimonialId" placeholder="Ej: PAT-IMP-001" {...register('patrimonialId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-brand">Marca</Label>
              <Input id="peripheral-brand" placeholder="Ej: HP, Epson" {...register('brand')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-model">Modelo</Label>
              <Input id="peripheral-model" placeholder="Ej: LaserJet M404n" {...register('model')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-status">Estado</Label>
              <Input id="peripheral-status" placeholder="Ej: Operativo, En Reparación" {...register('status')} />
            </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="peripheral-commonFailurePoints">Puntos Comunes de Falla (para IA) <span className="text-destructive">*</span></Label>
              <Textarea 
                id="peripheral-commonFailurePoints" 
                rows={3} 
                placeholder="Ej: Atasco de papel, tóner bajo, problemas de conectividad" 
                {...register('commonFailurePoints')} 
              />
              {errors.commonFailurePoints && <p className="text-sm text-destructive">{errors.commonFailurePoints.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Guardando Periférico...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Guardar Periférico
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
