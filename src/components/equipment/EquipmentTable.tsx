
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Equipment } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { ArrowUpDown, Eye, Search, Users, Trash2, Loader2, AlertTriangle } from 'lucide-react';
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
import { deleteEquipment } from '@/lib/actions';


interface EquipmentTableProps {
  equipments: Equipment[];
  onEquipmentDeleted: () => void;
}

type SortKey = keyof Equipment | null;

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipments, onEquipmentDeleted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(null);
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
  
  const handleDelete = async (equipmentId: string, equipmentName: string) => {
    setIsDeleting(equipmentId);
    try {
        await deleteEquipment(equipmentId);
        toast({
            title: "Equipo Eliminado",
            description: `El equipo ${equipmentName} y todos sus registros han sido eliminados.`,
        });
        onEquipmentDeleted();
    } catch (error) {
        toast({
            title: "Error al Eliminar",
            description: "No se pudo eliminar el equipo. Inténtelo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsDeleting(null);
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, Nombre, SO o Técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-80"
          />
        </div>
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
              <TableHead className="text-right">Acciones</TableHead>
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
                  <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={`/equipment/${equipment.id}`}>
                      <Eye size={16} className="mr-2" /> Información Detallada
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-9 w-9" disabled={isDeleting === equipment.id}>
                                {isDeleting === equipment.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center">
                                    <AlertTriangle size={20} className="mr-2 text-destructive" />
                                    ¿Confirmar Eliminación?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el equipo <strong>{equipment.name}</strong> y todos sus registros asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={() => handleDelete(equipment.id, equipment.name)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Sí, Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {filteredAndSortedEquipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
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
