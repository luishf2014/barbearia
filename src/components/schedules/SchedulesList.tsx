'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, EyeOff, Trash2 } from 'lucide-react';
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

interface CustomSchedule {
  id?: string;
  day: string;
  time: string;
  barber_id?: string;
  active: boolean;
  isDefault?: boolean; // Para identificar horários padrão
}

// Horários padrão de funcionamento
const DEFAULT_SCHEDULES: CustomSchedule[] = [
  // Segunda-feira
  { day: 'segunda', time: '08:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '09:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '10:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '11:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '12:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '13:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '14:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '15:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '16:00:00', active: true, isDefault: true },
  { day: 'segunda', time: '17:00:00', active: true, isDefault: true },
  // Terça-feira
  { day: 'terca', time: '08:00:00', active: true, isDefault: true },
  { day: 'terca', time: '09:00:00', active: true, isDefault: true },
  { day: 'terca', time: '10:00:00', active: true, isDefault: true },
  { day: 'terca', time: '11:00:00', active: true, isDefault: true },
  { day: 'terca', time: '12:00:00', active: true, isDefault: true },
  { day: 'terca', time: '13:00:00', active: true, isDefault: true },
  { day: 'terca', time: '14:00:00', active: true, isDefault: true },
  { day: 'terca', time: '15:00:00', active: true, isDefault: true },
  { day: 'terca', time: '16:00:00', active: true, isDefault: true },
  { day: 'terca', time: '17:00:00', active: true, isDefault: true },
  // Quarta-feira
  { day: 'quarta', time: '08:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '09:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '10:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '11:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '12:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '13:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '14:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '15:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '16:00:00', active: true, isDefault: true },
  { day: 'quarta', time: '17:00:00', active: true, isDefault: true },
  // Quinta-feira
  { day: 'quinta', time: '08:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '09:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '10:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '11:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '12:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '13:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '14:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '15:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '16:00:00', active: true, isDefault: true },
  { day: 'quinta', time: '17:00:00', active: true, isDefault: true },
  // Sexta-feira
  { day: 'sexta', time: '08:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '09:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '10:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '11:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '12:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '13:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '14:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '15:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '16:00:00', active: true, isDefault: true },
  { day: 'sexta', time: '17:00:00', active: true, isDefault: true },
  // Sábado
  { day: 'sabado', time: '08:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '09:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '10:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '11:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '12:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '13:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '14:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '15:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '16:00:00', active: true, isDefault: true },
  { day: 'sabado', time: '17:00:00', active: true, isDefault: true }
];

function SchedulesList() {
  const { barbers } = useBarbers();
  const [schedules, setSchedules] = useState<CustomSchedule[]>([]);
  const [defaultSchedulesState, setDefaultSchedulesState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Memoizar função de carregamento para evitar recriações desnecessárias
  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_schedules')
        .select('*')
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      
      // Combinar horários padrão com horários personalizados
      const customSchedules = data || [];
      const defaultSchedulesWithState = DEFAULT_SCHEDULES.map(schedule => {
        const key = `${schedule.day}-${schedule.time}`;
        return {
          ...schedule,
          active: defaultSchedulesState[key] !== undefined ? defaultSchedulesState[key] : schedule.active
        };
      });
      const allSchedules = [...defaultSchedulesWithState, ...customSchedules];
      
      setSchedules(allSchedules);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();

    // Listen for schedule additions
    const handleScheduleAdded = () => {
      loadSchedules();
    };

    window.addEventListener('scheduleAdded', handleScheduleAdded);
    return () => window.removeEventListener('scheduleAdded', handleScheduleAdded);
  }, [loadSchedules, defaultSchedulesState]);

  const handleDeleteSchedule = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este horário?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('custom_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadSchedules();
      toast.success('Horário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast.error('Erro ao remover horário');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const handleToggleSchedule = useCallback(async (id: string | undefined, active: boolean, schedule?: CustomSchedule) => {
    setLoading(true);
    try {
      if (id) {
        // Horário customizado - atualizar no banco
        const { error } = await supabase
          .from('custom_schedules')
          .update({ active: !active })
          .eq('id', id);

        if (error) throw error;
        await loadSchedules();
      } else if (schedule?.isDefault) {
        // Horário padrão - atualizar estado local
        const key = `${schedule.day}-${schedule.time}`;
        setDefaultSchedulesState(prev => ({
          ...prev,
          [key]: !active
        }));
      }
      
      toast.success(active ? 'Horário desativado' : 'Horário ativado');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do horário');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  // Memoizar os horários agrupados por dia para evitar recálculos desnecessários
  const schedulesByDay = useMemo(() => {
    const grouped: Record<string, CustomSchedule[]> = {};
    DAYS_OF_WEEK.forEach(day => {
      grouped[day.value] = schedules
        .filter(schedule => schedule.day === day.value)
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return grouped;
  }, [schedules]);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários Cadastrados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && schedules.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum horário cadastrado ainda.</p>
            <p className="text-sm">Adicione horários usando o formulário acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(day => {
              const daySchedules = schedulesByDay[day.value];
              
              if (daySchedules.length === 0) return null;
              
              return (
                <div key={day.value} className="border border-slate-600 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">{day.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {daySchedules.map((schedule) => {
                        const barber = barbers?.find(b => b.id === schedule.barber_id);
                        return (
                          <div 
                            key={schedule.id || `${schedule.day}-${schedule.time}`} 
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              schedule.isDefault 
                                ? 'bg-green-900/20 border-green-500/50' 
                                : schedule.active 
                                  ? 'bg-green-900/30 border-green-600' 
                                  : 'bg-slate-700 border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                schedule.active ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                              <div>
                                <span className="font-medium text-white">{schedule.time}</span>
                                <p className="text-sm text-gray-400">Todos os barbeiros</p>
                                {schedule.isDefault && (
                                  <p className="text-xs text-green-400 font-medium">Horário padrão</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleSchedule(schedule.id, schedule.active, schedule)}
                                disabled={loading}
                                className="text-gray-300 hover:text-white"
                              >
                                {schedule.active ? (
                                  <Eye className="h-4 w-4 text-green-400" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              {!schedule.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => schedule.id && handleDeleteSchedule(schedule.id)}
                                  disabled={loading}
                                  className="text-gray-300 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoizar o componente para evitar re-renderizações desnecessárias
export default memo(SchedulesList);