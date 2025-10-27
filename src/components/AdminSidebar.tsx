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
  CalendarPlus,
  Clock
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
    title: 'Horários',
    href: '/admin/horarios',
    icon: Clock
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
    <div className="bg-slate-800 h-full flex flex-col">
      <div className="p-4 lg:p-6 mt-16 md:mt-20">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6 font-oswald">ADMIN PANEL</h2>
        <nav className="space-y-1 lg:space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base",
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}