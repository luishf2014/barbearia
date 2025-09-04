'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBarbers } from '@/hooks/useBarbers';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];

export default function NovoAgendamentoPage() {
  const { barbers } = useBarbers();
  const { getAllUsers } = useAuth();
  const { getAvailableSlots, getAllSlotsWithStatus, createAppointment } = useAppointments();

  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isAvailable: boolean; }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      const users = await getAllUsers();
      setClients(users.filter(user => user.tipo === 'cliente'));
    };
    loadClients();
  }, [getAllUsers]);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedBarber && selectedDate) {
        const slots = await getAllSlotsWithStatus(selectedDate, selectedBarber);
        setAvailableSlots(slots);
      }
    };
    loadSlots();
  }, [selectedBarber, selectedDate, getAllSlotsWithStatus]);

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
    <div>
      <h1 className="text-3xl font-bold mb-8">Novo Agendamento</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <Select
                value={selectedDate}
                onValueChange={setSelectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma data" />
                </SelectTrigger>
                <SelectContent>
                  {nextSevenDays.map(date => (
                    <SelectItem key={date} value={date}>
                      {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Barbeiro</label>
              <Select
                value={selectedBarber}
                onValueChange={setSelectedBarber}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium">Horário</label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedBarber || !selectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots
                    .filter(slot => slot.isAvailable)
                    .map(slot => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Criando agendamento...' : 'Criar Agendamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}