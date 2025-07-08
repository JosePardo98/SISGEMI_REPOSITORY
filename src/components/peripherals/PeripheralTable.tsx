'use client';

import React, { useState, useMemo } from 'react';
import type { Peripheral } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { ArrowUpDown, Eye, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PeripheralTableProps {
  peripherals: Peripheral[];
}

type SortKey = keyof Peripheral | null;

export const PeripheralTable: React.FC<PeripheralTableProps> = ({ peripherals }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const filteredAndSortedPeripherals = useMemo(() => {
    let items = [...peripherals];

    if (searchTerm) {
      items = items.filter(p =>
        Object.values(p).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortKey) {
      items.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [peripherals, searchTerm, sortKey, sortOrder]);

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
          placeholder="Buscar en todos los campos..."
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
                <div className="flex items-center">ID {renderSortIcon('id')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Nombre {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Tipo {renderSortIcon('type')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('location')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Ubicación {renderSortIcon('location')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('lastMaintenanceDate')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">Último Mantenimiento {renderSortIcon('lastMaintenanceDate')}</div>
              </TableHead>
              <TableHead>Información</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPeripherals.length > 0 ? filteredAndSortedPeripherals.map((peripheral) => (
              <TableRow key={peripheral.id}>
                <TableCell className="font-medium">{peripheral.id}</TableCell>
                <TableCell>{peripheral.name}</TableCell>
                <TableCell>{peripheral.type}</TableCell>
                <TableCell>{peripheral.location || 'N/A'}</TableCell>
                <TableCell>{formatDate(peripheral.lastMaintenanceDate)}</TableCell>
                <TableCell>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/peripherals/${peripheral.id}`}>
                      <Eye size={16} className="mr-2" /> Información Detallada
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No se encontraron periféricos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
