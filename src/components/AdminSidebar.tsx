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
    <div className="pb-12 min-h-screen bg-slate-900">
      <div className="space-y-6 py-6">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-2 py-3 mb-6">
            <div className="bg-white rounded-full p-1.5">
              <Scissors className="h-4 w-4 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold">CAMISA 10</h2>
              <p className="text-slate-400 text-xs">BARBEARIA</p>
            </div>
          </div>
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all',
                  pathname === item.href 
                    ? 'bg-white/10 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5",
                  pathname === item.href ? "text-white" : "text-slate-400"
                )} />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}