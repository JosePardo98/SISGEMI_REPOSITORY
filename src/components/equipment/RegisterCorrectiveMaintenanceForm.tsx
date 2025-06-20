
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
import { addCorrectiveMaintenanceRecord } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

// Schema can be expanded later with more specific fields for corrective maintenance
const correctiveMaintenanceSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres detallando la falla y la solución."),
  // Example of potential future fields:
  // reportedBy: z.string().optional(),
  // issueType: z.string().optional(), // e.g., Hardware, Software, Network
  // partsReplaced: z.string().optional(),
});

type CorrectiveMaintenanceFormData = z.infer<typeof correctiveMaintenanceSchema>;

interface RegisterCorrectiveMaintenanceFormProps {
  equipmentId: string;
  equipmentName: string;
  onSuccess?: () => void;
}

export const RegisterCorrectiveMaintenanceForm: React.FC<RegisterCorrectiveMaintenanceFormProps> = ({ equipmentId, equipmentName, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CorrectiveMaintenanceFormData>({
    resolver: zodResolver(correctiveMaintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today
      technician: '',
      description: '',
    }
  });

  const onSubmit: SubmitHandler<CorrectiveMaintenanceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await addCorrectiveMaintenanceRecord({ ...data, equipmentId });
      toast({
        title: "Mantenimiento Correctivo Registrado",
        description: `El mantenimiento correctivo para ${equipmentName} ha sido guardado exitosamente.`,
        variant: "default",
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error registering corrective maintenance:", error);
      toast({
        title: "Error al Registrar",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar el mantenimiento correctivo. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Registrar Mantenimiento Correctivo</CardTitle>
        <CardDescription>Para: <span className="font-semibold">{equipmentName} (ID PC: {equipmentId})</span></CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="corrective-maintenance-date">Fecha de Intervención</Label>
            <Input id="corrective-maintenance-date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="corrective-maintenance-tecnico">Técnico Responsable</Label>
            <Input id="corrective-maintenance-tecnico" placeholder="Ej: Ana Torres" {...register('technician')} />
            {errors.technician && <p className="text-sm text-destructive">{errors.technician.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="corrective-maintenance-descripcion">Descripción del Problema y Solución Aplicada</Label>
            <Textarea 
              id="corrective-maintenance-descripcion" 
              rows={5} 
              placeholder="Ej: El equipo no encendía. Se reemplazó la fuente de poder ATX-500W. Pruebas OK." 
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
                <Save size={18} className="mr-2" /> Guardar Mantenimiento Correctivo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
