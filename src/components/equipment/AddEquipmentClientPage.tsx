
'use client';

import React from 'react';
import { AddEquipmentForm } from './AddEquipmentForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AddEquipmentClientPage: React.FC = () => {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back to the equipment list page after successful submission
    router.push('/'); 
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista de Equipos
          </Link>
        </Button>
      </div>
      
      <AddEquipmentForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddEquipmentClientPage;
