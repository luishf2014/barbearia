'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Users, Scissors, XCircle, TrendingUp, Clock, CheckCircle, BarChart, User } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { useBarbers } from '@/hooks/useBarbers';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';

type DashboardStats = {
  totalAppointments: number;
  canceledAppointments: number;
  totalClients: number;
  activeBarbers: number;
};

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];

export default function DashboardPage() {
  const { appointments } = useAppointments();
  const { barbers } = useBarbers();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    canceledAppointments: 0,
    totalClients: 0,
    activeBarbers: 0
  });

  useEffect(() => {
    if (appointments && barbers) {
      // Calcular estatísticas
      const totalAppointments = appointments.length;
      const canceledAppointments = appointments.filter(apt => apt.status === 'cancelado').length;
      const uniqueClients = new Set(appointments.map(apt => apt.cliente_id)).size;
      const activeBarbers = barbers.filter(barber => barber.status === 'ativo').length;

      setStats({
        totalAppointments,
        canceledAppointments,
        totalClients: uniqueClients,
        activeBarbers
      });
    }
  }, [appointments, barbers]);

  const cards = [
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
  
  // Calcular taxa de ocupação (exemplo: porcentagem de agendamentos em relação ao total possível)
  const occupancyRate = appointments?.length ? 
    Math.min(Math.round((appointments.filter(apt => apt.status === 'agendado').length / (barbers?.length || 1) / 8) * 100), 100) : 0;
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <BarChart className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">DASHBOARD</h1>
          </div>
          <p className="text-xl text-white/80">
            Visão geral do seu negócio - {capitalizedDayName}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {cards.map((card, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-white/80">{card.title}</h3>
                <div className={cn("p-2 rounded-full", card.bgColor)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white font-oswald">{card.value}</div>
              <div className={cn("h-1 w-16 mt-6 rounded-full", card.borderColor)}></div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-white rounded-full p-2">
                <Calendar className="h-6 w-6 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white font-oswald">PRÓXIMOS AGENDAMENTOS</h2>
            </div>
            <p className="text-white/70 mb-8">Agendamentos confirmados para os próximos dias</p>
            
            {appointments?.filter(apt => new Date(`${apt.data}T${apt.hora}`) > new Date() && apt.status === 'agendado').length === 0 ? (
              <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <p className="font-medium text-lg">Nenhum agendamento próximo</p>
                <p className="text-sm mt-2">Os próximos agendamentos aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  ?.filter(apt => new Date(`${apt.data}T${apt.hora}`) > new Date() && apt.status === 'agendado')
                  .slice(0, 5)
                  .map(apt => {
                    const barber = barbers?.find(b => b.id === apt.barber_id);
                    const isToday = format(parseISO(apt.data), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-6 border border-slate-700 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "p-3 rounded-full", 
                            isToday ? "bg-green-500/20" : "bg-blue-500/20"
                          )}>
                            {isToday ? <Clock className="h-5 w-5 text-green-500" /> : <Calendar className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg">
                              {isToday ? "Hoje" : format(parseISO(apt.data), "dd/MM/yyyy")} às {apt.hora}
                            </p>
                            <div className="flex items-center text-sm text-white/60 mt-1">
                              <Scissors className="h-3 w-3 mr-1" />
                              <span>{barber?.nome || "Barbeiro não encontrado"}</span>
                            </div>
                            <div className="flex items-center text-sm text-white/60 mt-1">
                              <User className="h-3 w-3 mr-1" />
                              <span>{apt.cliente?.nome || "Cliente não identificado"}</span>
                            </div>
                          </div>
                        </div>
                        {isToday && (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">
                            HOJE
                          </Badge>
                        )}
                        {!isToday && (
                          <div className="bg-blue-500/20 text-blue-500 text-xs font-medium px-3 py-1 rounded-full">
                            Confirmado
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-white rounded-full p-2">
                <TrendingUp className="h-6 w-6 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white font-oswald">TAXA DE OCUPAÇÃO</h2>
            </div>
            <p className="text-white/70 mb-8">Porcentagem de horários ocupados</p>
            
            <div className="mb-10">
              <div className="flex justify-between mb-3">
                <div>
                  <span className="text-white font-medium text-lg">{occupancyRate}%</span>
                  <span className="text-white/80 ml-2 font-medium">ocupado</span>
                </div>
                <div>
                  <span className="text-white/60 font-medium">{100 - occupancyRate}% livre</span>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner shadow-black/30">
                <div 
                  className={`h-full rounded-full ${occupancyRate > 80 ? 'bg-gradient-to-r from-red-600 to-red-400' : occupancyRate > 50 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-500/20 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-white/70 text-sm">Agendamentos Hoje</div>
                </div>
                <div className="text-3xl font-bold text-white font-oswald">
                  {appointments?.filter(apt => apt.status === 'agendado' && apt.data === format(new Date(), 'yyyy-MM-dd')).length || 0}
                </div>
              </div>
              <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-purple-500/20 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-white/70 text-sm">Horários Totais</div>
                </div>
                <div className="text-3xl font-bold text-white font-oswald">
                  {(barbers?.filter(b => b.status === 'ativo').length || 0) * 8}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-white rounded-full p-2">
              <Scissors className="h-6 w-6 text-slate-900" />
            </div>
            <h2 className="text-2xl font-bold text-white font-oswald">BARBEIROS HOJE</h2>
          </div>
          <p className="text-white/70 mb-8">Profissionais disponíveis para atendimento - {capitalizedDayName}</p>
          
          {barbers?.filter(barber => barber.status === 'ativo').length === 0 ? (
            <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
              <Scissors className="h-16 w-16 mx-auto mb-4 text-white/40" />
              <p className="font-medium text-lg">Nenhum barbeiro disponível</p>
              <p className="text-sm mt-2">Adicione barbeiros na seção de gerenciamento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {barbers
                ?.filter(barber => barber.status === 'ativo')
                .map(barber => (
                  <div
                    key={barber.id}
                    className="p-6 border border-slate-700 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/50"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-purple-500/20 p-3 rounded-full">
                        <Scissors className="h-6 w-6 text-purple-500" />
                      </div>
                      <Badge className="bg-green-500 text-white hover:bg-green-600">
                        Disponível
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-lg mb-3">{barber.nome}</h3>
                      <div className="flex items-center space-x-1 text-white/60 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>8 horários disponíveis</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
      

    </div>
  );
}