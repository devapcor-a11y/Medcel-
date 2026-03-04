'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CatalogoSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'default') {
      params.set('orden', value);
    } else {
      params.delete('orden');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const defaultValue = searchParams.get('orden') || 'default';

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline-block">
        Ordenar:
      </span>
      <Select value={defaultValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Más recientes</SelectItem>
          <SelectItem value="precio_menor">Menor precio</SelectItem>
          <SelectItem value="precio_mayor">Mayor precio</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
