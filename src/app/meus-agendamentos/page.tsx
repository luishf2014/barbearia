'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { useBarbers } from '@/hooks/useBarbers';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';
import { Scissors, Calendar, Clock, User, CheckCircle, X, History } from 'lucide-react';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];

type AppointmentWithBarber = Appointment & {
  barber: Pick<Barber, 'id' | 'nome'>;
};

export default function MeusAgendamentosPage() {
  const { appointments, cancelAppointment } = useAppointments();
  const { barbers } = useBarbers();
  const [detailedAppointments, setDetailedAppointments] = useState<AppointmentWithBarber[]>([]);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    if (appointments && barbers) {
      const detailed = appointments.map(apt => {
        const barber = barbers.find(b => b.id === apt.barber_id);
        return {
          ...apt,
          barber: barber ? {
            id: barber.id,
            nome: barber.nome
          } : {
            id: apt.barber_id,
            nome: 'Barbeiro não encontrado'
          }
        };
      });
      setDetailedAppointments(detailed);
    }
  }, [appointments, barbers]);

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      const result = await cancelAppointment(id);
      if (result.error) {
        console.error('Erro ao cancelar agendamento:', result.error);
        // Aqui você pode adicionar um toast ou notificação de erro
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    } finally {
      setCancelingId(null);
    }
  };

  const upcomingAppointments = detailedAppointments
    .filter(apt => new Date(`${apt.data}T${apt.hora}`) > new Date() && apt.status !== 'cancelado')
    .sort((a, b) => {
      const dateA = parseISO(`${a.data}T${a.hora}`);
      const dateB = parseISO(`${b.data}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });

  const pastAppointments = detailedAppointments
    .filter(apt => new Date(`${apt.data}T${apt.hora}`) <= new Date() || apt.status === 'cancelado')
    .sort((a, b) => {
      const dateA = parseISO(`${a.data}T${a.hora}`);
      const dateB = parseISO(`${b.data}T${b.hora}`);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
            <div className="bg-white rounded-full p-2 md:p-3">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-slate-900" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-oswald text-center sm:text-left">
              MEUS AGENDAMENTOS
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
            Gerencie seus horários na Camisa 10 Barbearia
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 md:space-y-12">
        <div>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-green-500 rounded-full p-1.5 sm:p-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white font-oswald">PRÓXIMOS AGENDAMENTOS</h2>
          </div>
          
          <div className="grid gap-3 sm:gap-4 md:gap-6">
            {upcomingAppointments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-slate-700 rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white/60" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-oswald mb-2">NENHUM AGENDAMENTO</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Você não tem agendamentos futuros.
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm mt-2">
                      Que tal agendar um novo horário?
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                        <div className="bg-green-500 rounded-full p-2 sm:p-3 flex-shrink-0">
                          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-bold text-white font-oswald truncate">
                              {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <span className="text-white/80 font-medium text-sm sm:text-base">{appointment.hora}</span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <span className="text-white/80 text-sm sm:text-base truncate">{appointment.barber.nome}</span>
                          </div>
                          <div className="mt-1.5 sm:mt-2">
                            <Badge className={`${appointment.status === 'confirmado' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : appointment.status === 'agendado' 
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                : appointment.status === 'pendente' 
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'} text-xs sm:text-sm`}>
                              {appointment.status === 'confirmado' 
                                ? '✓ Confirmado' 
                                : appointment.status === 'agendado' 
                                  ? '✓ Agendado' 
                                  : appointment.status === 'pendente' 
                                    ? '• Pendente' 
                                    : '✗ Cancelado'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 sm:px-6 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base w-full sm:w-auto"
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancelingId === appointment.id}
                      >
                        {cancelingId === appointment.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Cancelando...</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Cancelar</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-blue-500 rounded-full p-1.5 sm:p-2">
              <History className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white font-oswald">HISTÓRICO</h2>
          </div>
          
          <div className="grid gap-3 sm:gap-4 md:gap-6">
            {pastAppointments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-slate-700 rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <History className="h-8 w-8 sm:h-10 sm:w-10 text-white/60" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-oswald mb-2">NENHUM HISTÓRICO</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Nenhum agendamento anterior encontrado.
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm mt-2">
                      Seus agendamentos concluídos aparecerão aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(appointment => (
                <Card key={appointment.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                        <div className={`rounded-full p-2 sm:p-3 flex-shrink-0 ${
                          appointment.status === 'agendado' 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}>
                          {appointment.status === 'agendado' ? (
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          ) : (
                            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          )}
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-bold text-white font-oswald truncate">
                              {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <span className="text-white/80 font-medium text-sm sm:text-base">{appointment.hora}</span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                            <span className="text-white/80 text-sm sm:text-base truncate">{appointment.barber.nome}</span>
                          </div>
                          <div className="mt-1.5 sm:mt-2">
                            <Badge className={`text-xs sm:text-sm ${
                              appointment.status === 'agendado'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {appointment.status === 'agendado' ? '✓ Agendado' : '✗ Cancelado'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
              <div className="bg-white rounded-full p-2 sm:p-3">
                <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-oswald text-center sm:text-left">
                CAMISA 10 BARBEARIA
              </h3>
            </div>
            <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 px-4">
              Tradição e estilo em cada corte
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-white/70">
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-white mb-2 text-sm sm:text-base">📍 ENDEREÇO</h4>
                <p className="text-sm sm:text-base">Rua das Tesouras, 123</p>
                <p className="text-sm sm:text-base">Centro - São Paulo/SP</p>
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-white mb-2 text-sm sm:text-base">📞 CONTATO</h4>
                <p className="text-sm sm:text-base">(11) 99999-9999</p>
                <p className="text-sm sm:text-base break-all sm:break-normal">contato@camisa10barbearia.com</p>
              </div>
              <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
                <h4 className="font-bold text-white mb-2 text-sm sm:text-base">🕒 FUNCIONAMENTO</h4>
                <p className="text-sm sm:text-base">Segunda à Sexta: 9h às 19h</p>
                <p className="text-sm sm:text-base">Sábado: 8h às 17h</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}