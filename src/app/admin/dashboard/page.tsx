'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Users, Scissors, XCircle, TrendingUp, Clock, CheckCircle, BarChart, User, DollarSign, Target, AlertCircle } from 'lucide-react';
import { useAppointments, AppointmentWithDetails } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { useBarbers } from '@/hooks/useBarbers';
import { useServices } from '@/hooks/useServices';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';

// Lazy loading para componentes pesados
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'));
const BarberPerformance = lazy(() => import('@/components/dashboard/BarberPerformance'));
const RecentAppointments = lazy(() => import('@/components/dashboard/RecentAppointments'));
const AvailableBarbers = lazy(() => import('@/components/dashboard/AvailableBarbers'));

// Loading component
const LoadingCard = () => (
  <Card className="bg-slate-800 border-slate-700">
    <CardContent className="p-3 sm:p-6">
      <div className="animate-pulse">
        <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-6 sm:h-8 bg-slate-700 rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

type DashboardStats = {
  totalAppointments: number;
  canceledAppointments: number;
  totalClients: number;
  activeBarbers: number;
  totalRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageTicket: number;
};

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

type AppointmentWithService = AppointmentWithDetails & {
  service?: Service;
};

export default function DashboardPage() {
  const { appointments } = useAppointments();
  const { barbers } = useBarbers();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    canceledAppointments: 0,
    totalClients: 0,
    activeBarbers: 0,
    totalRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageTicket: 0
  });
  const [services, setServices] = useState<Service[]>([]);
  const [appointmentsWithServices, setAppointmentsWithServices] = useState<AppointmentWithService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar serviços usando o hook useServices
  const { services: servicesFromHook, loading: servicesLoading } = useServices();

  useEffect(() => {
    if (servicesFromHook && servicesFromHook.length > 0) {
      setServices(servicesFromHook);
      setIsLoading(servicesLoading);
    }
  }, [servicesFromHook, servicesLoading]);

  useEffect(() => {
    if (appointments && barbers && services.length > 0) {
      // Enriquecer agendamentos com dados de serviços
      const enrichedAppointments: AppointmentWithService[] = appointments.map(apt => {
        const service = services.find(s => s.id === apt.service_id);
        return {
          ...apt,
          service
        };
      });

      setAppointmentsWithServices(enrichedAppointments);


      // Calcular estatísticas
      const totalAppointments = appointments.length;
      const canceledAppointments = appointments.filter(apt => apt.status === 'cancelado').length;
      const uniqueClients = new Set(appointments.map(apt => apt.cliente_id)).size;
      const activeBarbers = barbers.filter(barber => barber.status === 'ativo').length;

      // Calcular receitas
      const confirmedAppointments = enrichedAppointments.filter(apt => apt.status === 'agendado');
      const totalRevenue = confirmedAppointments.reduce((sum, apt) => {
        const price = apt.preco ?? (apt.service?.preco ?? 30.00);
        return sum + price;
      }, 0);

      // Receita semanal
      const weekStart = startOfWeek(new Date(), { locale: ptBR });
      const weekEnd = endOfWeek(new Date(), { locale: ptBR });
      const weeklyRevenue = confirmedAppointments
        .filter(apt => {
          const aptDate = parseISO(apt.data);
          return isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
        })
        .reduce((sum, apt) => {
          const price = apt.preco ?? (apt.service?.preco ?? 30.00);
          return sum + price;
        }, 0);

      // Receita mensal
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const monthlyRevenue = confirmedAppointments
        .filter(apt => {
          const aptDate = parseISO(apt.data);
          return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, apt) => {
          const price = apt.preco ?? (apt.service?.preco ?? 30.00);
          return sum + price;
        }, 0);

      // Ticket médio
      const averageTicket = confirmedAppointments.length > 0
        ? totalRevenue / confirmedAppointments.length
        : 0;

      setStats({
        totalAppointments,
        canceledAppointments,
        totalClients: uniqueClients,
        activeBarbers,
        totalRevenue,
        weeklyRevenue,
        monthlyRevenue,
        averageTicket
      });
    }
  }, [appointments, barbers, services]);

  const cards = [
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500'
    },
    {
      title: 'Receita Semanal',
      value: `R$ ${stats.weeklyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toFixed(2)}`,
      icon: BarChart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toFixed(2)}`,
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500'
    },
    {
      title: 'Total de Agendamentos',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500'
    },
    {
      title: 'Agendamentos Cancelados',
      value: stats.canceledAppointments,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500'
    },
    {
      title: 'Clientes Únicos',
      value: stats.totalClients,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500'
    },
    {
      title: 'Barbeiros Ativos',
      value: stats.activeBarbers,
      icon: Scissors,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500'
    }
  ];

  // Calcular dia da semana atual
  const currentDayName = format(new Date(), 'EEEE', { locale: ptBR });
  const capitalizedDayName = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 px-3 sm:px-6">
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <LoadingCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-3 sm:px-6">
      <Toaster richColors position="top-right" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-6 sm:py-10 px-4 sm:px-8 rounded-xl mb-6 sm:mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="bg-white rounded-full p-1.5 sm:p-2">
              <BarChart className="h-4 w-4 sm:h-6 sm:w-6 text-slate-900" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white font-oswald">DASHBOARD</h1>
          </div>
          <p className="text-base sm:text-xl text-white/80">
            Visão geral do seu negócio - {capitalizedDayName}
          </p>
        </div>
      </div>

      {/* Stats Cards com Lazy Loading */}
      <Suspense fallback={<div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">{[...Array(4)].map((_, i) => <LoadingCard key={i} />)}</div>}>
        <StatsCards stats={stats} />
      </Suspense>

      {/* Barber Performance com Lazy Loading */}
      <div className="mb-6 sm:mb-8">
        <Suspense fallback={<LoadingCard />}>
          <BarberPerformance barbers={barbers || []} appointments={appointmentsWithServices} />
        </Suspense>
      </div>

      {/* Recent Appointments com Lazy Loading */}
      <div className="mb-6 sm:mb-8">
        <Suspense fallback={<LoadingCard />}>
          <RecentAppointments appointments={appointmentsWithServices} />
        </Suspense>
      </div>

      {/* Available Barbers com Lazy Loading */}
      <div className="mb-6 sm:mb-8">
        <Suspense fallback={<LoadingCard />}>
          <AvailableBarbers barbers={barbers || []} dayName={capitalizedDayName} />
        </Suspense>
      </div>
    </div>
  );
}