'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentWithDetails } from '@/hooks/useAppointments';
import { Database } from '@/lib/supabase';

type Service = Database['public']['Tables']['services']['Row'];

type AppointmentWithService = AppointmentWithDetails & {
  service?: Service;
};

interface RecentAppointmentsProps {
  appointments: AppointmentWithService[];
}

export default function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'concluido':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  // Pegar os últimos 10 agendamentos
  const recentAppointments = appointments
    .sort((a, b) => {
      const dateA = parseISO(`${a.data}T${a.hora}`);
      const dateB = parseISO(`${b.data}T${b.hora}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  return (
    <Card className="bg-slate-800 border-slate-700 mb-8 sm:mb-12">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-full p-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-oswald">AGENDAMENTOS RECENTES</h2>
        </div>
        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Últimos agendamentos realizados</p>
        
        <div className="space-y-4">
          {recentAppointments.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-white/40" />
              <p className="font-medium">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            recentAppointments.map((appointment) => {
              const appointmentDate = parseISO(`${appointment.data}T${appointment.hora}`);
              
              return (
                <div key={appointment.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-700/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white rounded-full p-2">
                        <User className="h-4 w-4 text-slate-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          {appointment.cliente?.nome || 'Cliente não encontrado'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(appointmentDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(appointmentDate, 'HH:mm')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Scissors className="h-3 w-3" />
                            <span>{appointment.barber?.nome || 'Barbeiro não definido'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-white">R$ {(appointment.service?.preco || 30).toFixed(2)}</p>
                        <p className="text-xs text-slate-400">
                          {appointment.service?.nome || 'Corte Tradicional'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}