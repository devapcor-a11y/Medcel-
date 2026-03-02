'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, DollarSign, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/dashboard/productos', icon: Store },
  { name: 'Finanzas', href: '/dashboard/finanzas', icon: DollarSign },
  { name: 'Ajustes', href: '/dashboard/configuracion', icon: Settings },
];

export default function MobileNavbar() {
  const pathname = usePathname();

  return (
    <div className="pb-safe fixed bottom-0 z-50 w-full border-t border-border bg-card shadow-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center space-y-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'fill-primary/20')}
              />
              <span className="text-[10px] font-medium leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
