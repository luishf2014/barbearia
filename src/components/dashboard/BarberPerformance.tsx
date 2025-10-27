'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Scissors, User } from 'lucide-react';
import { AppointmentWithDetails } from '@/hooks/useAppointments';
import { Database } from '@/lib/supabase';

type Barber = Database['public']['Tables']['barbers']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

type AppointmentWithService = AppointmentWithDetails & {
  service?: Service;
};

interface BarberPerformanceProps {
  barbers: Barber[];
  appointments: AppointmentWithService[];
}

export default function BarberPerformance({ barbers, appointments }: BarberPerformanceProps) {
  const barberStats = barbers?.map(barber => {
    const barberAppointments = appointments?.filter(
      apt => apt.barber_id === barber.id && apt.status === 'agendado'
    ) || [];
    
    return {
      ...barber,
      appointmentCount: barberAppointments.length,
      revenue: barberAppointments.reduce((sum, apt) => sum + (apt.service?.preco || 30), 0)
    };
  }).sort((a, b) => b.appointmentCount - a.appointmentCount) || [];

  const maxAppointments = Math.max(...barberStats.map(b => b.appointmentCount), 1);

  return (
    <Card className="bg-slate-800 border-slate-700 mb-8 sm:mb-12">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-full p-2">
            <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-oswald">PERFORMANCE DOS BARBEIROS</h2>
        </div>
        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Agendamentos por barbeiro este mês</p>
        
        <div className="space-y-4">
          {barberStats.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-white/40" />
              <p className="font-medium">Nenhum barbeiro encontrado</p>
            </div>
          ) : (
            barberStats.map((barber) => {
              const percentage = maxAppointments > 0 ? (barber.appointmentCount / maxAppointments) * 100 : 0;
              
              return (
                <div key={barber.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-2">
                        <User className="h-4 w-4 text-slate-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{barber.nome}</h3>
                        <p className="text-sm text-slate-400">
                          {barber.appointmentCount} agendamentos • R$ {barber.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{barber.appointmentCount}</span>
                      <p className="text-xs text-slate-400">agendamentos</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
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