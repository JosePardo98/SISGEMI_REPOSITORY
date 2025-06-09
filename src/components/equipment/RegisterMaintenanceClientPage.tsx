'use client';

import React, { useEffect, useState } from 'react';
import type { Equipment, MaintenanceRecord } from '@/lib/types';
import { getEquipmentById, getMaintenanceRecordsForEquipment } from '@/lib/actions';
import { RegisterMaintenanceForm } from './RegisterMaintenanceForm';
import { AiSuggestions } from './AiSuggestions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface RegisterMaintenanceClientPageProps {
  equipmentId: string;
}

const RegisterMaintenanceClientPage: React.FC<RegisterMaintenanceClientPageProps> = ({ equipmentId }) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const eqData = await getEquipmentById(equipmentId);
        if (eqData) {
          setEquipment(eqData);
          const historyData = await getMaintenanceRecordsForEquipment(equipmentId);
          setMaintenanceHistory(historyData);
        } else {
          setError('Equipo no encontrado.');
        }
      } catch (err) {
        setError('Error al cargar datos para el registro de mantenimiento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [equipmentId]);

  const handleMaintenanceSuccess = async () => {
    // Re-fetch maintenance history after a successful registration to update AI suggestions if needed
    if(equipment) {
      const historyData = await getMaintenanceRecordsForEquipment(equipment.id);
      setMaintenanceHistory(historyData);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-1/4" /> {/* Back button */}
        <Skeleton className="h-96 w-full" /> {/* Form skeleton */}
        <Skeleton className="h-64 w-full" /> {/* AI suggestions skeleton */}
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
    <div className="space-y-8">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/equipment/${equipment.id}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver al Detalle del Equipo
          </Link>
        </Button>
      </div>
      
      <RegisterMaintenanceForm 
        equipmentId={equipment.id} 
        equipmentName={equipment.name}
        onSuccess={handleMaintenanceSuccess}
      />
      
      <AiSuggestions equipment={equipment} maintenanceHistory={maintenanceHistory} />
    </div>
  );
};

export default RegisterMaintenanceClientPage;
