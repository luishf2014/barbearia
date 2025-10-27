'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Scissors, XCircle, TrendingUp, DollarSign, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsCards = [
    {
      title: 'Total de Agendamentos',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Agendamentos Cancelados',
      value: stats.canceledAppointments,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Barbeiros Ativos',
      value: stats.activeBarbers,
      icon: Scissors,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '0%',
      changeType: 'neutral' as const
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Receita Semanal',
      value: `R$ ${stats.weeklyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      change: '+22%',
      changeType: 'positive' as const
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toFixed(2)}`,
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+18%',
      changeType: 'positive' as const
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      change: '+3%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "text-xs font-medium",
                      stat.changeType === 'positive' ? 'text-green-400' :
                      stat.changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {stat.change} vs mês anterior
                    </span>
                  </div>
                </div>
                <div className={cn("p-2 sm:p-3 rounded-full flex-shrink-0 ml-2", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}