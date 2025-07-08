'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { getAiMaintenanceSuggestions } from '@/lib/ai-actions';
import type { Peripheral, PeripheralMaintenanceRecord } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface AiPeripheralSuggestionsProps {
  peripheral: Peripheral;
  maintenanceHistory: PeripheralMaintenanceRecord[];
}

export const AiPeripheralSuggestions: React.FC<AiPeripheralSuggestionsProps> = ({ peripheral, maintenanceHistory }) => {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    const historySummary = maintenanceHistory
      .slice(0, 5) // Limit to last 5 records
      .map(record => `Fecha: ${record.date}, Técnico: ${record.technician}, Descripción: ${record.description}`)
      .join('\n');

    try {
      const result = await getAiMaintenanceSuggestions({
        equipmentType: peripheral.type,
        maintenanceHistory: historySummary || 'Sin historial de mantenimiento reciente.',
        commonFailurePoints: peripheral.commonFailurePoints || 'No especificados.',
      });
      setSuggestions(result.suggestedProcedures);
    } catch (err) {
      console.error('AI Suggestion Error:', err);
      setError('No se pudieron obtener las sugerencias de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary flex items-center">
          <Wand2 size={24} className="mr-2 text-accent" /> Sugerencias de Mantenimiento (IA)
        </CardTitle>
        <CardDescription>
          Obtenga una lista de procedimientos sugeridos por IA para este tipo de periférico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchSuggestions} disabled={loading} className="mb-4 bg-accent hover:bg-accent/90 text-accent-foreground">
          {loading ? <><Loader2 size={18} className="mr-2 animate-spin" /> Obteniendo...</> : 'Obtener Sugerencias IA'}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && (
          <div className="mt-4 p-4 bg-secondary/30 rounded-md border border-border">
            <h4 className="font-semibold mb-2 text-foreground">Procedimientos Sugeridos:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {suggestions.split('\n').map((item, index) => 
                item.trim() && <li key={index}>{item.replace(/^- /, '')}</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
