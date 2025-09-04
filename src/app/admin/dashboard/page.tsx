'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Scissors, XCircle } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { useBarbers } from '@/hooks/useBarbers';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Database } from '@/lib/supabase';

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
      color: 'text-blue-600'
    },
    {
      title: 'Agendamentos Cancelados',
      value: stats.canceledAppointments,
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      title: 'Clientes Únicos',
      value: stats.totalClients,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Barbeiros Ativos',
      value: stats.activeBarbers,
      icon: Scissors,
      color: 'text-purple-600'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments
              ?.filter(apt => new Date(`${apt.data}T${apt.hora}`) > new Date() && apt.status === 'agendado')
              .slice(0, 5)
              .map(apt => {
                const barber = barbers?.find(b => b.id === apt.barber_id);
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="font-medium">
                        {format(parseISO(apt.data), "dd/MM/yyyy")} às {apt.hora}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Barbeiro: {barber?.nome}
                      </p>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barbeiros Disponíveis Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {barbers
              ?.filter(barber => barber.status === 'ativo')
              .map(barber => (
                <div
                  key={barber.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span>{barber.nome}</span>
                  </div>
                  <span className="text-sm text-green-600">Disponível</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}