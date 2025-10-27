'use client';

import { useState } from 'react';
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
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function MobileAdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-600"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pb-12 min-h-screen">
          <div className="space-y-6 py-6">
            {/* Header */}
            <div className="px-4 py-2 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white font-oswald">CAMISA 10</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSidebar}
                  className="text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="px-4 py-2">
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
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
      </div>
    </>
  );
}