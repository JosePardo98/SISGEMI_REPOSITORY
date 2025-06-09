
'use client';

import React from 'react';
import { EditEquipmentForm } from './EditEquipmentForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditEquipmentClientPageProps {
  equipmentId: string;
}

const EditEquipmentClientPage: React.FC<EditEquipmentClientPageProps> = ({ equipmentId }) => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(`/equipment/${equipmentId}`); 
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/equipment/${equipmentId}`}>
            <ArrowLeft size={16} className="mr-2" /> Volver a Detalles del Equipo
          </Link>
        </Button>
      </div>
      
      <EditEquipmentForm equipmentId={equipmentId} onSuccess={handleSuccess} />
    </div>
  );
};

export default EditEquipmentClientPage;
