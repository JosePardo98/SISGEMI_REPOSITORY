'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import { PlusCircle, List } from 'lucide-react';

const TicketsClientPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

    return (
        <div className="animate-fade-in space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <CardTitle>Gestión de Tickets de Soporte</CardTitle>
                            <CardDescription>
                                Seleccione una opción para continuar.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setActiveTab('create')} variant={activeTab === 'create' ? 'default' : 'outline'}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Ticket
                            </Button>
                            <Button onClick={() => setActiveTab('view')} variant={activeTab === 'view' ? 'default' : 'outline'}>
                                <List className="mr-2 h-4 w-4" />
                                Ver Tickets
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {activeTab === 'create' && <TicketForm />}
            {activeTab === 'view' && 
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Listado de Tickets</CardTitle>
                        <CardDescription>Revise el estado de todos los tickets generados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TicketList />
                    </CardContent>
                </Card>
            }
        </div>
    );
};

export default TicketsClientPage;
