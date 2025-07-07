'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const TicketsClientPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'form'>('list');

    const handleTicketCreated = () => {
        setView('list'); // Switch back to the list view after creation
    };

    // Show the form view
    if (view === 'form') {
        return (
            <div className="animate-fade-in space-y-6">
                <Button variant="outline" onClick={() => setView('list')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Listado
                </Button>
                <TicketForm onTicketCreated={handleTicketCreated} />
            </div>
        );
    }

    // Show the list view by default
    return (
        <div className="animate-fade-in">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <CardTitle>Listado de Tickets</CardTitle>
                            <CardDescription>Revise el estado de todos los tickets generados.</CardDescription>
                        </div>
                        <Button onClick={() => setView('form')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Ticket
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <TicketList />
                </CardContent>
            </Card>
        </div>
    );
};

export default TicketsClientPage;
