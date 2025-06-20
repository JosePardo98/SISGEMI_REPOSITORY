
'use client';

import React, { useState, useMemo } from 'react';
import type { Equipment } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { ArrowUpDown, Eye, Search, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface EquipmentTableProps {
  equipments: Equipment[];
}

type SortKey = keyof Equipment | null;

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const filteredAndSortedEquipments = useMemo(() => {
    let items = [...equipments];

    if (searchTerm) {
      items = items.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.lastTechnician && eq.lastTechnician.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortKey) {
      items.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return sortOrder === 'asc' ? 1 : -1;
        if (valB === undefined) return sortOrder === 'asc' ? -1 : 1;
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        // Fallback for other types or mixed types (e.g. date strings)
        const strA = String(valA);
        const strB = String(valB);
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }
    return items;
  }, [equipments, searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={16} className="ml-2 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUpDown size={16} className="ml-2" /> : <ArrowUpDown size={16} className="ml-2 transform rotate-180" />;
  };
  

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por ID, Nombre, SO o Técnico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full md:w-1/2"
        />
      </div>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">ID PC {renderSortIcon('id')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Nombre PC {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('os')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Sistema Operativo {renderSortIcon('os')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('lastMaintenanceDate')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Último Mantenimiento {renderSortIcon('lastMaintenanceDate')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('lastTechnician')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Ingeniero(s): {renderSortIcon('lastTechnician')}</div>
              </TableHead>
              <TableHead>Información</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedEquipments.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell className="font-medium">{equipment.id}</TableCell>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>{equipment.os}</TableCell>
                <TableCell>{formatDate(equipment.lastMaintenanceDate)}</TableCell>
                <TableCell>{equipment.lastTechnician || 'N/A'}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/equipment/${equipment.id}`}>
                      <Eye size={16} className="mr-2" /> Ver información Detallada
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {filteredAndSortedEquipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No se encontraron equipos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

