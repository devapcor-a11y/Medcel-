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
  BarChart,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/dashboard/productos', icon: Store },
  { name: 'Finanzas', href: '/dashboard/finanzas', icon: DollarSign },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
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
    <aside
      className="hidden min-h-screen w-64 flex-col border-r border-border bg-card md:flex"
      aria-label="Sidebar"
    >
      <div className="border-b border-border p-6 pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="h-6 w-6 object-contain"
            style={{
              filter:
                'brightness(0) saturate(100%) invert(58%) sepia(87%) saturate(3015%) hue-rotate(345deg) brightness(101%) contrast(100%)',
            }}
          />
          Medcel
        </h2>
        <p className="ml-8 mt-1 truncate text-xs font-medium text-muted-foreground opacity-80">
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
          <Link href="/productos" target="_blank">
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
    </aside>
  );
}
