'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBarbers } from '@/hooks/useBarbers';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import type { Client } from '@/hooks/useClients';
import { useSchedule } from '@/hooks/useSchedule';
import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Scissors, CalendarPlus } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];

export default function NovoAgendamentoPage() {
  const { barbers } = useBarbers();
  const { clients } = useClients();
  const { getAvailableSlots } = useSchedule();
  const { createAppointment } = useAppointments();

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ time_slot: string; is_available: boolean; }[]>([]);
  const [loading, setLoading] = useState(false);

  // Clientes são carregados automaticamente pelo hook useClients

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedBarber && selectedDate) {
        const slots = await getAvailableSlots(selectedBarber, selectedDate);
        setAvailableSlots(slots);
      }
    };
    loadSlots();
  }, [selectedBarber, selectedDate, getAvailableSlots]);

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  const handleSubmit = async () => {
    if (!selectedClient || !selectedBarber || !selectedDate || !selectedTime) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        barber_id: selectedBarber,
        cliente_id: selectedClient,
        data: selectedDate,
        hora: selectedTime,
        status: 'agendado'
      });
      toast.success('Agendamento criado com sucesso!');
      setSelectedClient('');
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <CalendarPlus className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">NOVO AGENDAMENTO</h1>
          </div>
          <p className="text-xl text-white/80">
            Crie um novo agendamento para um cliente
          </p>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white">Informações do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <User className="h-4 w-4" /> Cliente
              </label>
              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-slate-500">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {clients.map((client: Client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data
              </label>
              <Select
                value={selectedDate}
                onValueChange={setSelectedDate}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-slate-500">
                  <SelectValue placeholder="Selecione uma data" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {nextSevenDays.map(date => (
                    <SelectItem key={date} value={date}>
                      {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Scissors className="h-4 w-4" /> Barbeiro
              </label>
              <Select
                value={selectedBarber}
                onValueChange={setSelectedBarber}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-slate-500">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {barbers
                    ?.filter(barber => barber.status === 'ativo')
                    .map(barber => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Horário
              </label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedBarber || !selectedDate}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-slate-500">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {availableSlots.map(slot => (
                    <SelectItem
                      key={slot.time_slot}
                      value={slot.time_slot}
                      disabled={!slot.is_available}
                      className={!slot.is_available ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      {slot.time_slot} {!slot.is_available ? ' (ocupado)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white mt-6"
            onClick={handleSubmit}
            disabled={loading}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            {loading ? 'Criando agendamento...' : 'Criar Agendamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}