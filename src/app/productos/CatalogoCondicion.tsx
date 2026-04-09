'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CatalogoCondicion() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCondicionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'todos') {
      params.set('condicion', value);
    } else {
      params.delete('condicion');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const defaultValue = searchParams.get('condicion') || 'todos';

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline-block">
        Condición:
      </span>
      <Select value={defaultValue} onValueChange={handleCondicionChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Condición" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="nuevo">Nuevo</SelectItem>
          <SelectItem value="usado">Usado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
