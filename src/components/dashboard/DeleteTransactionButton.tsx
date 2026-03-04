'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteTransaction } from '@/app/dashboard/finanzas/actions';
import { toast } from 'sonner';

export default function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if (confirm('¿Estás seguro de eliminar este movimiento financiero?')) {
          startTransition(async () => {
            const result = await deleteTransaction(id);
            if (result?.error) {
              toast.error(result.error);
            } else {
              toast.success('Movimiento eliminado con éxito');
            }
          });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
