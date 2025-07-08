'use client';

import React from 'react';
import { EditTicketForm } from './EditTicketForm';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface EditTicketClientPageProps {
  ticketId: string;
}

const EditTicketClientPage: React.FC<EditTicketClientPageProps> = ({ ticketId }) => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/'); 
  };

  const handleCancel = () => {
     router.push('/');
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Button onClick={handleCancel} variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft size={16} className="mr-2" /> Volver al Listado de Tickets
        </Button>
      </div>
      
      <EditTicketForm ticketId={ticketId} onSuccess={handleSuccess} />
    </div>
  );
};

export default EditTicketClientPage;
