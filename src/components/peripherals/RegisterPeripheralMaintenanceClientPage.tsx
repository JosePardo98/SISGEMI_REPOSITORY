'use client';

import React, { useEffect, useState } from 'react';
import type { Peripheral, PeripheralMaintenanceRecord } from '@/lib/types';
import { getPeripheralById, getPeripheralMaintenanceRecords } from '@/lib/actions';
import { RegisterPeripheralMaintenanceForm } from './RegisterPeripheralMaintenanceForm';
import { AiPeripheralSuggestions } from './AiPeripheralSuggestions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface RegisterPeripheralMaintenanceClientPageProps {
  peripheralId: string;
}

const RegisterPeripheralMaintenanceClientPage: React.FC<RegisterPeripheralMaintenanceClientPageProps> = ({ peripheralId }) => {
  const [peripheral, setPeripheral] = useState<Peripheral | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<PeripheralMaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const pData = await getPeripheralById(peripheralId);
        if (pData) {
          setPeripheral(pData);
          const historyData = await getPeripheralMaintenanceRecords(peripheralId);
          setMaintenanceHistory(historyData);
        } else {
          setError('Periférico no encontrado.');
        }
      } catch (err) {
        setError('Error al cargar datos para el registro de mantenimiento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [peripheralId]);

  const handleMaintenanceSuccess = async () => {
    if(peripheral) {
      const historyData = await getPeripheralMaintenanceRecords(peripheral.id);
      setMaintenanceHistory(historyData);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
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
          <Link href={`/peripherals/${peripheralId}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver al Detalle
          </Link>
        </Button>
      </Alert>
    );
  }

  if (!peripheral) {
    return <p>Periférico no encontrado.</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/peripherals/${peripheral.id}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver al Detalle del Periférico
          </Link>
        </Button>
      </div>
      
      <RegisterPeripheralMaintenanceForm 
        peripheralId={peripheral.id} 
        peripheralName={peripheral.name}
        onSuccess={handleMaintenanceSuccess}
      />
      
      <AiPeripheralSuggestions peripheral={peripheral} maintenanceHistory={maintenanceHistory} />
    </div>
  );
};

export default RegisterPeripheralMaintenanceClientPage;
