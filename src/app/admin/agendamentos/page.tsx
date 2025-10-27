'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointments } from '@/hooks/useAppointments';
import { useBarbers } from '@/hooks/useBarbers';
import { useClients } from '@/hooks/useClients';
import { useDebounce } from '@/hooks/useDebounce';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar, User, Scissors } from 'lucide-react';
import { Toaster } from 'sonner';
import { Database } from '@/lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];

type DetailedAppointment = Appointment & {
  barber?: { nome: string };
  cliente?: { nome: string; email?: string };
};

export default function AgendamentosPage() {
  const { appointments, cancelAppointment } = useAppointments();
  const { barbers } = useBarbers();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [detailedAppointments, setDetailedAppointments] = useState<DetailedAppointment[]>([]);
  
  // Debounce do termo de busca para melhorar performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Popular agendamentos detalhados a partir do hook useAppointments
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const detailed = appointments.map(apt => {
        // Fallback para barbeiro pelo ID
        const barberById = barbers?.find(b => b.id === apt.barber_id);
        // Fallback para cliente pelo ID
        const clientById = clients?.find(c => c.id === apt.cliente_id);

        return {
          ...apt,
          barber: apt.barber
            ? { nome: apt.barber.nome }
            : barberById
              ? { nome: barberById.nome }
              : { nome: 'Barbeiro não encontrado' },
          cliente: apt.cliente
            ? { nome: apt.cliente.nome, email: apt.cliente.email }
            : clientById
              ? { nome: clientById.nome, email: clientById.email }
              : { nome: 'Cliente não encontrado' }
        }
      })

      setDetailedAppointments(detailed)
    } else {
      setDetailedAppointments([])
    }
  }, [appointments, barbers, clients])

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    setLoading(true);
    try {
      await cancelAppointment(appointmentId);
      // Atualizar a lista local
      setDetailedAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'cancelado' } : apt
        )
      );
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoizar filtragem para evitar recálculos desnecessários
  const filteredAppointments = useMemo(() => {
    return detailedAppointments
      .filter(apt => {
        const matchesSearch = 
          (apt.cliente?.nome || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (apt.barber?.nome || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        const matchesStatus =
          statusFilter === 'all' ||
          apt.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = parseISO(`${a.data}T${a.hora}`);
        const dateB = parseISO(`${b.data}T${b.hora}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [detailedAppointments, debouncedSearchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <Calendar className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">GERENCIAR AGENDAMENTOS</h1>
          </div>
          <p className="text-xl text-white/80">
            Visualize e gerencie todos os agendamentos da barbearia
          </p>
        </div>
      </div>

      <Card className="mb-6 bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
              <Input
                placeholder="Buscar por cliente ou barbeiro"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-white/50 focus:border-slate-500"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="agendado">Agendados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredAppointments.map(appointment => (
          <Card key={appointment.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="font-semibold text-white text-lg">
                    {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })} às {appointment.hora}
                  </h2>
                  <div className="flex items-center text-sm text-white/60 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{appointment.cliente?.nome || 'Cliente não encontrado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-white/60 mt-1">
                    <Scissors className="h-3 w-3 mr-1" />
                    <span>{appointment.barber?.nome || 'Barbeiro não encontrado'}</span>
                  </div>
                  <Badge 
                    variant={appointment.status === 'agendado' ? 'default' : 'secondary'}
                    className={appointment.status === 'agendado' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500/20 text-red-500'}
                  >
                    {appointment.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                  </Badge>
                </div>

                {appointment.status === 'agendado' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {loading ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <p className="font-medium text-lg text-white">
              {searchTerm || statusFilter !== 'all'
                ? 'Nenhum agendamento encontrado com os filtros aplicados'
                : 'Nenhum agendamento registrado'}
            </p>
            <p className="text-sm mt-2">Os agendamentos aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}