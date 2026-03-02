'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  DollarSign,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/dashboard/productos', icon: Store },
  { name: 'Finanzas', href: '/dashboard/finanzas', icon: DollarSign },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="hidden min-h-screen w-64 flex-col border-r border-border bg-card md:flex">
      <div className="border-b border-border p-6">
        <h2 className="flex items-center text-xl font-semibold tracking-tight text-primary">
          DigiBrain
        </h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {user?.email}
        </p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border p-4">
        <Button
          variant="outline"
          className="w-full justify-start bg-card text-muted-foreground"
          asChild
        >
          <Link href="/catalogo" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Catálogo
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
