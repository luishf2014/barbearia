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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await cancelAppointment(id);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = detailedAppointments
    .filter(apt => new Date(`${apt.data}T${apt.hora}`) > new Date() && apt.status === 'agendado')
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
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-white rounded-full p-3">
              <Calendar className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald">
              MEUS AGENDAMENTOS
            </h1>
          </div>
          <p className="text-xl text-white/80 mb-8">
            Gerencie seus horários na Camisa 10 Barbearia
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white font-oswald">PRÓXIMOS AGENDAMENTOS</h2>
          </div>
          
          <div className="grid gap-6">
            {upcomingAppointments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="bg-slate-700 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-white/60" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-oswald mb-2">NENHUM AGENDAMENTO</h3>
                    <p className="text-white/70">
                      Você não tem agendamentos futuros.
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Que tal agendar um novo horário?
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-500 rounded-full p-3">
                          <Scissors className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-white/60" />
                            <h3 className="text-lg font-bold text-white font-oswald">
                              {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-white/60" />
                            <span className="text-white/80 font-medium">{appointment.hora}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <User className="h-4 w-4 text-white/60" />
                            <span className="text-white/80">{appointment.barber.nome}</span>
                          </div>
                          <div className="mt-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              ✓ Agendado
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                        onClick={() => handleCancel(appointment.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                        <span>{loading ? 'Cancelando...' : 'Cancelar'}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-blue-500 rounded-full p-2">
              <History className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white font-oswald">HISTÓRICO</h2>
          </div>
          
          <div className="grid gap-6">
            {pastAppointments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="bg-slate-700 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <History className="h-10 w-10 text-white/60" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-oswald mb-2">NENHUM HISTÓRICO</h3>
                    <p className="text-white/70">
                      Nenhum agendamento anterior encontrado.
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Seus agendamentos concluídos aparecerão aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(appointment => (
                <Card key={appointment.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-3 ${
                          appointment.status === 'agendado' 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}>
                          {appointment.status === 'agendado' ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <X className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-white/60" />
                            <h3 className="text-lg font-bold text-white font-oswald">
                              {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-white/60" />
                            <span className="text-white/80 font-medium">{appointment.hora}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <User className="h-4 w-4 text-white/60" />
                            <span className="text-white/80">{appointment.barber.nome}</span>
                          </div>
                          <div className="mt-2">
                            <Badge className={`${
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
      <footer className="bg-black py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white rounded-full p-3">
                <Scissors className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-3xl font-bold text-white font-oswald">CAMISA 10 BARBEARIA</h3>
            </div>
            <p className="text-white/80 text-lg mb-8">
              Tradição e estilo em cada corte
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-white/70">
              <div>
                <h4 className="font-bold text-white mb-2">📍 ENDEREÇO</h4>
                <p>Rua das Tesouras, 123</p>
                <p>Centro - São Paulo/SP</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">📞 CONTATO</h4>
                <p>(11) 99999-9999</p>
                <p>contato@camisa10barbearia.com</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">🕒 FUNCIONAMENTO</h4>
                <p>Segunda à Sexta: 9h às 19h</p>
                <p>Sábado: 8h às 17h</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}