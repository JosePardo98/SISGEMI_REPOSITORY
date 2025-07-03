'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form';
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
import { Loader2, Save, ImagePlus, Trash2 } from 'lucide-react';

const maintenanceSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  images: z.array(z.object({
      url: z.string().min(1, "La URL de la imagen es requerida."),
      description: z.string(),
  })).optional(),
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

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today
      technician: '',
      description: '',
      images: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images"
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    append({ url: e.target.result as string, description: '' });
                }
            };
            reader.readAsDataURL(file);
        });
        // Reset file input to allow selecting the same file again
        event.target.value = '';
    }
  };

  const onSubmit: SubmitHandler<MaintenanceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await addMaintenanceRecord({ ...data, equipmentId });
      toast({
        title: "Mantenimiento Registrado",
        description: `El mantenimiento para ${equipmentName} ha sido guardado exitosamente. (Simulado)`,
        variant: "default",
      });
      reset();
      if (onSuccess) onSuccess();
      // Optionally redirect or update UI
      // router.push(`/equipment/${equipmentId}`); // Example redirect
    } catch (error) {
      console.error("Error registering maintenance:", error);
      toast({
        title: "Error al Registrar",
        description: "Hubo un problema al guardar el mantenimiento. Intente de nuevo.",
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

          <div className="space-y-4">
            <Label>Evidencia Fotográfica (Opcional)</Label>
            <Card className="p-4 bg-secondary/30 border-dashed">
                <div className="space-y-4">
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-2 border rounded-md bg-background">
                            <img src={item.url} alt={`Evidencia ${index + 1}`} className="w-24 h-24 object-cover rounded-md flex-shrink-0"/>
                            <div className="flex-grow space-y-2 w-full">
                                <Label htmlFor={`images.${index}.description`}>Descripción de la imagen {index + 1}</Label>
                                <Textarea
                                    id={`images.${index}.description`}
                                    placeholder="Ej: Estado del disipador antes de la limpieza."
                                    {...register(`images.${index}.description` as const)}
                                    rows={2}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="flex-shrink-0">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Label htmlFor="image-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                        <div className="text-center">
                            <ImagePlus size={24} className="mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Haga clic para agregar imágenes</p>
                        </div>
                    </Label>
                    <Input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange}
                    />
                </div>
            </Card>
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
