'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addMaintenanceRecord } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

const maintenanceSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface RegisterMaintenanceFormProps {
  equipmentId: string;
  equipmentName: string;
  onSuccess?: () => void;
}

export const RegisterMaintenanceForm: React.FC<RegisterMaintenanceFormProps> = ({ equipmentId, equipmentName, onSuccess }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today
      technician: '',
      description: '',
    }
  });

  const onSubmit: SubmitHandler<MaintenanceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        equipmentId,
      };

      await addMaintenanceRecord(payload);
      toast({
        title: "Mantenimiento Registrado",
        description: `El mantenimiento para ${equipmentName} ha sido guardado exitosamente.`,
        variant: "default",
      });
      reset();
      if (onSuccess) {
        onSuccess();
      }
      router.push(`/equipment/${equipmentId}`);
    } catch (error) {
      console.error("Error registering maintenance:", error);
      toast({
        title: "Error al Registrar",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar el mantenimiento. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Registrar Nuevo Mantenimiento</CardTitle>
        <CardDescription>Para: <span className="font-semibold">{equipmentName} (ID PC: {equipmentId})</span></CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maintenance-date">Fecha</Label>
            <Input id="maintenance-date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-tecnico">Técnico</Label>
            <Input id="maintenance-tecnico" placeholder="Ej: Juan Pérez" {...register('technician')} />
            {errors.technician && <p className="text-sm text-destructive">{errors.technician.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-descripcion">Descripción</Label>
            <Textarea 
              id="maintenance-descripcion" 
              rows={5} 
              placeholder="Ej: Limpieza de componentes, actualización de software, revisión de virus." 
              {...register('description')} 
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Guardar Mantenimiento
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
