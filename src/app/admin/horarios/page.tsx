'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAvailableHours, DaySchedule } from '@/hooks/useAvailableHours';
import { useBarbers } from '@/hooks/useBarbers';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function HorariosPage() {
  const { barbers } = useBarbers();
  const { 
    fetchBarberAvailableHours, 
    createAvailableHour, 
    updateAvailableHour,
    deleteAvailableHour,
    getScheduleByDay
  } = useAvailableHours();
  
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [scheduleByDay, setScheduleByDay] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para novo horário
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1, // Segunda-feira
    startTime: '08:00',
    endTime: '18:00',
    intervalMinutes: 30
  });

  // Carregar horários do barbeiro selecionado
  useEffect(() => {
    if (selectedBarberId) {
      loadBarberSchedule(selectedBarberId);
    }
  }, [selectedBarberId]);

  const loadBarberSchedule = async (barberId: string) => {
    setLoading(true);
    try {
      const hours = await fetchBarberAvailableHours(barberId);
      if (hours) {
        const schedule = getScheduleByDay(hours);
        setScheduleByDay(schedule);
      }
    } catch (error) {
      toast.error('Erro ao carregar horários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo horário
  const handleAddSlot = async () => {
    if (!selectedBarberId) {
      toast.error('Selecione um barbeiro');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await createAvailableHour({
        barber_id: selectedBarberId,
        day_of_week: newSlot.dayOfWeek,
        start_time: newSlot.startTime,
        end_time: newSlot.endTime,
        interval_minutes: newSlot.intervalMinutes
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Horário adicionado com sucesso');
      await loadBarberSchedule(selectedBarberId);
    } catch (error) {
      toast.error('Erro ao adicionar horário');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status de um horário (ativo/inativo)
  const handleToggleStatus = async (dayIndex: number, slotIndex: number, isActive: boolean) => {
    const slot = scheduleByDay[dayIndex].slots[slotIndex];
    if (!slot.id) return;

    try {
      setLoading(true);
      const { error } = await updateAvailableHour(slot.id, { is_active: isActive });

      if (error) {
        toast.error(error);
        return;
      }

      // Atualizar estado local
      const updatedSchedule = [...scheduleByDay];
      updatedSchedule[dayIndex].slots[slotIndex].isActive = isActive;
      setScheduleByDay(updatedSchedule);

      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Excluir um horário
  const handleDeleteSlot = async (dayIndex: number, slotIndex: number) => {
    const slot = scheduleByDay[dayIndex].slots[slotIndex];
    if (!slot.id) return;

    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      setLoading(true);
      const { error } = await deleteAvailableHour(slot.id);

      if (error) {
        toast.error(error);
        return;
      }

      // Atualizar estado local
      const updatedSchedule = [...scheduleByDay];
      updatedSchedule[dayIndex].slots.splice(slotIndex, 1);
      setScheduleByDay(updatedSchedule);

      toast.success('Horário excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir horário');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Horários Disponíveis</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Barbeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="barber">Barbeiro</Label>
                <Select 
                  value={selectedBarberId} 
                  onValueChange={setSelectedBarberId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers?.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBarberId && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Horário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="day">Dia da Semana</Label>
                    <Select 
                      value={newSlot.dayOfWeek.toString()} 
                      onValueChange={(value) => setNewSlot({...newSlot, dayOfWeek: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Domingo</SelectItem>
                        <SelectItem value="1">Segunda-feira</SelectItem>
                        <SelectItem value="2">Terça-feira</SelectItem>
                        <SelectItem value="3">Quarta-feira</SelectItem>
                        <SelectItem value="4">Quinta-feira</SelectItem>
                        <SelectItem value="5">Sexta-feira</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Horário Inicial</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Horário Final</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="interval">Intervalo (minutos)</Label>
                    <Select 
                      value={newSlot.intervalMinutes.toString()} 
                      onValueChange={(value) => setNewSlot({...newSlot, intervalMinutes: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddSlot} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Horário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedBarberId && scheduleByDay.map((day, dayIndex) => (
          <Card key={day.dayOfWeek}>
            <CardHeader>
              <CardTitle>{day.dayName}</CardTitle>
            </CardHeader>
            <CardContent>
              {day.slots.length === 0 ? (
                <p className="text-muted-foreground">Nenhum horário configurado para este dia.</p>
              ) : (
                <div className="space-y-4">
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slot.id || slotIndex} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {slot.startTime} - {slot.endTime} ({slot.intervalMinutes} min)
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={slot.isActive} 
                            onCheckedChange={(checked: boolean) => handleToggleStatus(dayIndex, slotIndex, checked)}
                          />
                          <span className={slot.isActive ? "text-green-600" : "text-red-600"}>
                            {slot.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSlot(dayIndex, slotIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}