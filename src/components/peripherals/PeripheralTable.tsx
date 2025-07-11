
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Peripheral } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { ArrowUpDown, Eye, Search, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deletePeripheral } from '@/lib/actions';

interface PeripheralTableProps {
  peripherals: Peripheral[];
  onPeripheralDeleted: () => void;
}

type SortKey = keyof Peripheral | null;

export const PeripheralTable: React.FC<PeripheralTableProps> = ({ peripherals, onPeripheralDeleted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const topDiv = topScrollRef.current;
    const bottomDiv = bottomScrollRef.current;

    if (!topDiv || !bottomDiv) return;

    const syncScrolls = (source: HTMLDivElement, target: HTMLDivElement) => {
      if (source.scrollLeft !== target.scrollLeft) {
        target.scrollLeft = source.scrollLeft;
      }
    };
    
    let topTimeout: NodeJS.Timeout;
    let bottomTimeout: NodeJS.Timeout;

    const handleTopScroll = () => {
      clearTimeout(bottomTimeout);
      requestAnimationFrame(() => syncScrolls(topDiv, bottomDiv));
    };

    const handleBottomScroll = () => {
       clearTimeout(topTimeout);
      requestAnimationFrame(() => syncScrolls(bottomDiv, topDiv));
    };
    
    topDiv.addEventListener('scroll', handleTopScroll);
    bottomDiv.addEventListener('scroll', handleBottomScroll);

    return () => {
      topDiv.removeEventListener('scroll', handleTopScroll);
      bottomDiv.removeEventListener('scroll', handleBottomScroll);
      clearTimeout(topTimeout);
      clearTimeout(bottomTimeout);
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleDelete = async (peripheralId: string) => {
    setIsDeleting(peripheralId);
    try {
        await deletePeripheral(peripheralId);
        toast({
            title: "Periférico Eliminado",
            description: `El periférico con ID ${peripheralId} y todos sus registros han sido eliminados.`,
        });
        onPeripheralDeleted();
    } catch (error) {
        toast({
            title: "Error al Eliminar",
            description: "No se pudo eliminar el periférico. Inténtelo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsDeleting(null);
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
       <div 
          ref={topScrollRef} 
          className="overflow-x-auto"
          style={{ scrollbarWidth: 'none' }} // Firefox
      >
        <div style={{ height: '1px' }}></div>
      </div>
      <div ref={bottomScrollRef} className="rounded-md border shadow-sm overflow-auto">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-accent/50">
                <div className="flex items-center">ID {renderSortIcon('id')}</div>
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
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPeripherals.length > 0 ? filteredAndSortedPeripherals.map((peripheral) => (
              <TableRow key={peripheral.id}>
                <TableCell className="font-medium">{peripheral.id}</TableCell>
                <TableCell>{peripheral.type}</TableCell>
                <TableCell>{peripheral.location || 'N/A'}</TableCell>
                <TableCell>{formatDate(peripheral.lastMaintenanceDate)}</TableCell>
                <TableCell>
                  <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={`/peripherals/${peripheral.id}`}>
                      <Eye size={16} className="mr-2" /> Información Detallada
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-9 w-9" disabled={isDeleting === peripheral.id}>
                                {isDeleting === peripheral.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center">
                                    <AlertTriangle size={20} className="mr-2 text-destructive" />
                                    ¿Confirmar Eliminación?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el periférico con ID <strong>{peripheral.id}</strong> y todos sus registros asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={() => handleDelete(peripheral.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Sí, Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
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
