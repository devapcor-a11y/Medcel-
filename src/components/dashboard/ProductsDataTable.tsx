'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatArs, formatUsd } from '@/utils/currency';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  Pencil,
  Search,
  Image as ImageIcon,
  FilterX,
  Filter,
} from 'lucide-react';
import DeleteProductButton from '@/components/dashboard/DeleteProductButton';

export function ProductsDataTable({
  data,
  exchangeRate,
}: {
  data: any[];
  exchangeRate: any;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns: ColumnDef<any>[] = [
    {
      id: 'img',
      header: 'Img',
      cell: ({ row }) => {
        const prod = row.original;
        const thumbnail = prod.producto_fotos?.[0]?.url;
        return (
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={`Img`}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
            )}
          </div>
        );
      },
      enableGlobalFilter: false,
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="line-clamp-2 max-w-[200px] font-medium">
          {row.getValue('nombre')}
        </div>
      ),
    },
    {
      id: 'categoria',
      accessorFn: (row) => row.categorias?.nombre || '-',
      header: ({ column, table }) => {
        const uniqueCategories = React.useMemo(() => {
          const cats = new Set<string>();
          table.getPreFilteredRowModel().rows.forEach((row) => {
            const val = row.getValue('categoria');
            if (val) cats.add(val as string);
          });
          return Array.from(cats).sort();
        }, [table.getPreFilteredRowModel().rows]);

        const isFiltered = column.getIsFiltered();

        return (
          <div className="flex items-center gap-1">
            <span>Categoría</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${isFiltered ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4 text-sm">
                <div className="space-y-2">
                  <h4 className="mb-3 font-medium leading-none text-muted-foreground">
                    Filtrar Categoría
                  </h4>
                  <Select
                    value={(column.getFilterValue() as string) || 'all'}
                    onValueChange={(val) =>
                      column.setFilterValue(val === 'all' ? '' : val)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: ({ column }) => {
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center gap-1">
            <span>Estado</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${isFiltered ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4 text-sm">
                <div className="space-y-2">
                  <h4 className="mb-3 font-medium leading-none text-muted-foreground">
                    Filtrar Estado
                  </h4>
                  <Select
                    value={(column.getFilterValue() as string) || 'all'}
                    onValueChange={(val) =>
                      column.setFilterValue(val === 'all' ? '' : val)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                      <SelectItem value="reservado">
                        Reservado / Pausado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        return (
          <Badge
            variant="outline"
            className={
              estado === 'disponible'
                ? 'border-primary bg-primary/10 text-primary'
                : estado === 'vendido'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-yellow-500 bg-yellow-50 text-yellow-600'
            }
          >
            {estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'sexo',
      header: 'Sexo',
      cell: ({ row }) => {
        const sexo = row.getValue('sexo') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {sexo}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock / Talles',
      cell: ({ row }) => {
        const prod = row.original;
        const variantes = prod.producto_variantes || [];
        
        if (variantes.length === 0) {
           return <div className="text-center font-bold">{prod.stock}</div>;
        }

        return (
          <div className="flex flex-col gap-1 items-center justify-center">
             <div className="text-xs font-bold w-full text-center border-b border-border/50 pb-1 mb-1">Total: {prod.stock}</div>
             <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
               {variantes.map((v: any) => (
                 <Badge key={v.id} variant={v.stock > 0 ? 'secondary' : 'outline'} className="text-[10px] px-1 py-0 h-4">
                   {v.talle}: {v.stock}
                 </Badge>
               ))}
             </div>
          </div>
        );
      },
    },
    {
      id: 'precioArs',
      accessorFn: (row) => row.precio_ars,
      filterFn: 'inNumberRange',
      header: ({ column }) => {
        const value = (column.getFilterValue() as [number, number]) || [];
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center justify-end gap-1">
            <span>Precio ARS</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${isFiltered ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4 text-sm">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none text-muted-foreground">
                    Filtrar Monto ARS
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="grid flex-1 gap-1">
                      <Input
                        type="number"
                        placeholder="Min ($)"
                        value={value?.[0] ?? ''}
                        onChange={(e) =>
                          column.setFilterValue((old: [number, number]) => [
                            e.target.value ? Number(e.target.value) : undefined,
                            old?.[1],
                          ])
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="grid flex-1 gap-1">
                      <Input
                        type="number"
                        placeholder="Max ($)"
                        value={value?.[1] ?? ''}
                        onChange={(e) =>
                          column.setFilterValue((old: [number, number]) => [
                            old?.[0],
                            e.target.value ? Number(e.target.value) : undefined,
                          ])
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
      cell: ({ row }) => {
        const p = row.getValue('precioArs') as number;
        return (
          <div className="text-right font-medium">{p ? formatArs(p) : '-'}</div>
        );
      },
    },
    {
      id: 'precioUsd',
      accessorFn: (row) => {
        return (
          row.precio_usd ||
          (row.precio_ars ? row.precio_ars / exchangeRate.venta : 0)
        );
      },
      filterFn: 'inNumberRange',
      header: ({ column }) => {
        const value = (column.getFilterValue() as [number, number]) || [];
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center justify-end gap-1">
            <span>Precio USD</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${isFiltered ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4 text-sm">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none text-muted-foreground">
                    Filtrar Monto USD
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="grid flex-1 gap-1">
                      <Input
                        type="number"
                        placeholder="Min ($)"
                        value={value?.[0] ?? ''}
                        onChange={(e) =>
                          column.setFilterValue((old: [number, number]) => [
                            e.target.value ? Number(e.target.value) : undefined,
                            old?.[1],
                          ])
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="grid flex-1 gap-1">
                      <Input
                        type="number"
                        placeholder="Max ($)"
                        value={value?.[1] ?? ''}
                        onChange={(e) =>
                          column.setFilterValue((old: [number, number]) => [
                            old?.[0],
                            e.target.value ? Number(e.target.value) : undefined,
                          ])
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
      cell: ({ row }) => {
        const p = row.getValue('precioUsd') as number;
        return (
          <div className="text-right text-sm text-muted-foreground">
            {p ? formatUsd(p) : '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const prod = row.original;
        const hasTx = prod.transacciones && prod.transacciones.length > 0;
        return (
          <div className="flex items-center justify-end gap-2 text-right">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/productos/${prod.id}`}>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/productos/editar/${prod.id}`}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <DeleteProductButton id={prod.id} hasTransactions={hasTx} />
          </div>
        );
      },
      enableGlobalFilter: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Búsqueda global..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setGlobalFilter('');
            table.resetColumnFilters();
          }}
          className="w-full text-muted-foreground sm:w-auto"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Limpiar Filtros
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table className="min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
