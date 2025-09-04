'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useBarbers } from '@/hooks/useBarbers';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Barber = Database['public']['Tables']['barbers']['Row'];

type DetailedAppointment = {
  id: string;
  data: string;
  hora: string;
  status: string;
  client: {
    id: string;
    nome: string;
    email: string;
  };
  barber: {
    id: string;
    nome: string;
  };
};

export default function AgendamentosPage() {
  const { appointments, cancelAppointment } = useAppointments();
  const { barbers } = useBarbers();
  const { getAllUsers } = useAuth();
  const [detailedAppointments, setDetailedAppointments] = useState<DetailedAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointmentsWithDetails();
  }, [appointments, barbers]);

  const loadAppointmentsWithDetails = async () => {
    if (!appointments || !barbers) return;

    try {
      const users = await getAllUsers();
      
      const detailed = await Promise.all(
        appointments.map(async (apt) => {
          const client = users.find((user: User) => user.id === apt.cliente_id);
          const barber = barbers.find((b: Barber) => b.id === apt.barber_id);

          return {
            id: apt.id,
            data: apt.data,
            hora: apt.hora,
            status: apt.status,
            client: client ? {
              id: client.id,
              nome: client.nome,
              email: client.email
            } : {
              id: apt.cliente_id,
              nome: 'Cliente não encontrado',
              email: ''
            },
            barber: barber ? {
              id: barber.id,
              nome: barber.nome
            } : {
              id: apt.barber_id,
              nome: 'Barbeiro não encontrado'
            }
          };
        })
      );

      setDetailedAppointments(detailed);
    } catch (err) {
      setError('Erro ao carregar detalhes dos agendamentos');
    }
  };

  const handleCancel = async (id: string) => {
    setLoading(true);
    try {
      await cancelAppointment(id);
      loadAppointmentsWithDetails();
    } catch (err) {
      setError('Erro ao cancelar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = detailedAppointments
    .filter(apt => {
      const matchesSearch = 
        apt.client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.barber.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Agendamentos</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou barbeiro"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
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
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-semibold">
                    {format(parseISO(appointment.data), "dd 'de' MMMM", { locale: ptBR })} às {appointment.hora}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {appointment.client.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Barbeiro: {appointment.barber.nome}
                  </p>
                  <Badge 
                    variant={appointment.status === 'agendado' ? 'default' : 'secondary'}
                  >
                    {appointment.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                  </Badge>
                </div>

                {appointment.status === 'agendado' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={loading}
                  >
                    {loading ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhum agendamento encontrado com os filtros aplicados'
              : 'Nenhum agendamento registrado'}
          </div>
        )}
      </div>
    </div>
  );
}