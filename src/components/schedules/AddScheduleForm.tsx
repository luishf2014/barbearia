'use client';

import { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useBarbers } from '@/hooks/useBarbers';

const DAYS_OF_WEEK = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

interface CustomSchedule {
  day: string;
  time: string;
  barber_id?: string;
  active: boolean;
}

function AddScheduleForm() {
  const { barbers } = useBarbers();
  const [formData, setFormData] = useState<CustomSchedule>({
    day: '',
    time: '',
    barber_id: 'all',
    active: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day || !formData.time) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Verificar se já existe um horário igual
      const { data: existing, error: checkError } = await supabase
        .from('custom_schedules')
        .select('id')
        .eq('day', formData.day)
        .eq('time', formData.time)
        .eq('barber_id', formData.barber_id || null)
        .single();

      if (existing) {
        toast.error('Este horário já está cadastrado para este barbeiro');
        return;
      }

      // Inserir novo horário
      const { error } = await supabase
        .from('custom_schedules')
        .insert({
          day: formData.day,
          time: formData.time,
          barber_id: formData.barber_id === 'all' ? null : formData.barber_id,
          active: formData.active
        });

      if (error) throw error;

      toast.success('Horário adicionado com sucesso!');
      
      // Resetar formulário
      setFormData({
        day: '',
        time: '',
        barber_id: 'all',
        active: true
      });

      // Disparar evento para atualizar a lista
      window.dispatchEvent(new Event('scheduleAdded'));
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast.error('Erro ao adicionar horário');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleInputChange = useCallback((field: keyof CustomSchedule, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5 text-blue-500" />
          Adicionar Novo Horário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dia da semana */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Dia da Semana *</label>
              <Select
                value={formData.day}
                onValueChange={(value) => handleInputChange('day', value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Horário *</label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleInputChange('time', value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barbeiro */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Barbeiro</label>
              <Select
                value={formData.barber_id}
                onValueChange={(value) => handleInputChange('barber_id', value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Todos os barbeiros" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="all">Todos os barbeiros</SelectItem>
                  {barbers?.filter(barber => barber.status === 'ativo').map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão de adicionar */}
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading || !formData.day || !formData.time}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adicionando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Memoizar o componente para evitar re-renderizações desnecessárias
export default memo(AddScheduleForm);