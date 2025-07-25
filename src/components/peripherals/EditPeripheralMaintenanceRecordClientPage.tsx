'use client';

import React from 'react';
import { EditPeripheralMaintenanceRecordForm } from './EditPeripheralMaintenanceRecordForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditClientPageProps {
  peripheralId: string;
  recordId: string;
}

const EditPeripheralMaintenanceRecordClientPage: React.FC<EditClientPageProps> = ({ peripheralId, recordId }) => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(`/peripherals/${peripheralId}`); 
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/peripherals/${peripheralId}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver a Detalles del Periférico
          </Link>
        </Button>
      </div>
      
      <EditPeripheralMaintenanceRecordForm peripheralId={peripheralId} recordId={recordId} onSuccess={handleSuccess} />
    </div>
  );
};

export default EditPeripheralMaintenanceRecordClientPage;
