'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  Scissors,
  LayoutDashboard,
  UserPlus,
  CalendarPlus
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Agendamentos',
    href: '/admin/agendamentos',
    icon: Calendar
  },
  {
    title: 'Clientes',
    href: '/admin/clientes',
    icon: Users
  },
  {
    title: 'Barbeiros',
    href: '/admin/barbeiros',
    icon: Scissors
  },
  {
    title: 'Novo Cliente',
    href: '/admin/novo-cliente',
    icon: UserPlus
  },
  {
    title: 'Novo Agendamento',
    href: '/admin/novo-agendamento',
    icon: CalendarPlus
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Administração</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href ? 'bg-accent' : 'transparent'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}