
'use client';

import React, { useEffect, useState } from 'react';
import type { Equipment } from '@/lib/types';
import { getEquipmentById } from '@/lib/actions';
import { RegisterCorrectiveMaintenanceForm } from './RegisterCorrectiveMaintenanceForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RegisterCorrectiveMaintenanceClientPageProps {
  equipmentId: string;
}

const RegisterCorrectiveMaintenanceClientPage: React.FC<RegisterCorrectiveMaintenanceClientPageProps> = ({ equipmentId }) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const eqData = await getEquipmentById(equipmentId);
        if (eqData) {
          setEquipment(eqData);
        } else {
          setError('Equipo no encontrado.');
        }
      } catch (err) {
        setError('Error al cargar datos del equipo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [equipmentId]);

  const handleMaintenanceSuccess = () => {
    // Navigate back to the equipment detail page after successful submission
    router.push(`/equipment/${equipmentId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-1/4" /> {/* Back button */}
        <Skeleton className="h-96 w-full" /> {/* Form skeleton */}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
         <Button asChild variant="outline" className="mt-4">
          <Link href={`/equipment/${equipmentId}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver al Detalle
          </Link>
        </Button>
      </Alert>
    );
  }

  if (!equipment) {
    return <p>Equipo no encontrado.</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/equipment/${equipment.id}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver al Detalle del Equipo
          </Link>
        </Button>
      </div>
      
      <RegisterCorrectiveMaintenanceForm 
        equipmentId={equipment.id} 
        equipmentName={equipment.name}
        onSuccess={handleMaintenanceSuccess}
      />
      
      {/* AI Suggestions for corrective maintenance could be added here in the future */}
    </div>
  );
};

export default RegisterCorrectiveMaintenanceClientPage;
