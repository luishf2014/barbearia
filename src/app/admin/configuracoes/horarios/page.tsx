'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchedule, BusinessHour, AvailableHour } from '@/hooks/useSchedule';
import { useBarbers } from '@/hooks/useBarbers';
import { Clock, Settings, Save, Plus, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export default function HorariosPage() {
  const { getBusinessHours, updateBusinessHours, getBarberHours, updateBarberHours, loading } = useSchedule();
  const { barbers } = useBarbers();
  
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [barberHours, setBarberHours] = useState<AvailableHour[]>([]);
  const [newBusinessHour, setNewBusinessHour] = useState({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '18:00',
    interval_minutes: 30
  });
  const [newBarberHour, setNewBarberHour] = useState({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '18:00',
    interval_minutes: 30
  });

  useEffect(() => {
    loadBusinessHours();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      loadBarberHours(selectedBarber);
    }
  }, [selectedBarber]);

  const loadBusinessHours = async () => {
    const hours = await getBusinessHours();
    setBusinessHours(hours);
  };

  const loadBarberHours = async (barberId: string) => {
    const hours = await getBarberHours(barberId);
    setBarberHours(hours);
  };

  const handleSaveBusinessHours = async () => {
    const success = await updateBusinessHours(businessHours.map(hour => ({
      day_of_week: hour.day_of_week,
      start_time: hour.start_time,
      end_time: hour.end_time,
      interval_minutes: hour.interval_minutes,
      is_active: hour.is_active
    })));
    
    if (success) {
      toast.success('Horários do negócio atualizados com sucesso!');
    } else {
      toast.error('Erro ao atualizar horários do negócio');
    }
  };

  const handleSaveBarberHours = async () => {
    if (!selectedBarber) return;
    
    const success = await updateBarberHours(selectedBarber, barberHours.map(hour => ({
      day_of_week: hour.day_of_week,
      start_time: hour.start_time,
      end_time: hour.end_time,
      interval_minutes: hour.interval_minutes,
      is_active: hour.is_active
    })));
    
    if (success) {
      toast.success('Horários do barbeiro atualizados com sucesso!');
    } else {
      toast.error('Erro ao atualizar horários do barbeiro');
    }
  };

  const addBusinessHour = () => {
    const newHour: BusinessHour = {
      id: `temp-${Date.now()}`,
      ...newBusinessHour,
      is_active: true
    };
    setBusinessHours([...businessHours, newHour]);
  };

  const addBarberHour = () => {
    if (!selectedBarber) return;
    
    const newHour: AvailableHour = {
      id: `temp-${Date.now()}`,
      barber_id: selectedBarber,
      ...newBarberHour,
      is_active: true
    };
    setBarberHours([...barberHours, newHour]);
  };

  const removeBusinessHour = (index: number) => {
    const updated = [...businessHours];
    updated.splice(index, 1);
    setBusinessHours(updated);
  };

  const removeBarberHour = (index: number) => {
    const updated = [...barberHours];
    updated.splice(index, 1);
    setBarberHours(updated);
  };

  const updateBusinessHour = (index: number, field: keyof BusinessHour, value: any) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const updateBarberHour = (index: number, field: keyof AvailableHour, value: any) => {
    const updated = [...barberHours];
    updated[index] = { ...updated[index], [field]: value };
    setBarberHours(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <Settings className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">CONFIGURAÇÃO DE HORÁRIOS</h1>
          </div>
          <p className="text-xl text-white/80">
            Configure os horários de funcionamento do negócio e horários específicos por barbeiro
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Horários do Negócio */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Padrão do Negócio
            </CardTitle>
            <p className="text-white/70">
              Estes horários serão usados quando um barbeiro não tiver horários específicos configurados
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário para adicionar novo horário */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-700 rounded-lg">
              <Select
                value={newBusinessHour.day_of_week.toString()}
                onValueChange={(value) => setNewBusinessHour({...newBusinessHour, day_of_week: parseInt(value)})}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="time"
                value={newBusinessHour.start_time}
                onChange={(e) => setNewBusinessHour({...newBusinessHour, start_time: e.target.value})}
                className="bg-slate-600 border-slate-500 text-white"
              />
              
              <Input
                type="time"
                value={newBusinessHour.end_time}
                onChange={(e) => setNewBusinessHour({...newBusinessHour, end_time: e.target.value})}
                className="bg-slate-600 border-slate-500 text-white"
              />
              
              <Input
                type="number"
                value={newBusinessHour.interval_minutes}
                onChange={(e) => setNewBusinessHour({...newBusinessHour, interval_minutes: parseInt(e.target.value)})}
                className="bg-slate-600 border-slate-500 text-white"
                placeholder="Intervalo (min)"
              />
              
              <Button onClick={addBusinessHour} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de horários existentes */}
            <div className="space-y-2">
              {businessHours.map((hour, index) => (
                <div key={hour.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-700 rounded-lg">
                  <Select
                    value={hour.day_of_week.toString()}
                    onValueChange={(value) => updateBusinessHour(index, 'day_of_week', parseInt(value))}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="time"
                    value={hour.start_time}
                    onChange={(e) => updateBusinessHour(index, 'start_time', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                  
                  <Input
                    type="time"
                    value={hour.end_time}
                    onChange={(e) => updateBusinessHour(index, 'end_time', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                  
                  <Input
                    type="number"
                    value={hour.interval_minutes}
                    onChange={(e) => updateBusinessHour(index, 'interval_minutes', parseInt(e.target.value))}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                  
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={hour.is_active}
                      onChange={(e) => updateBusinessHour(index, 'is_active', e.target.checked)}
                      className="rounded"
                    />
                    <span>Ativo</span>
                  </label>
                  
                  <Button
                    onClick={() => removeBusinessHour(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveBusinessHours}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Horários do Negócio'}
            </Button>
          </CardContent>
        </Card>

        {/* Horários por Barbeiro */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Específicos por Barbeiro
            </CardTitle>
            <p className="text-white/70">
              Configure horários específicos para cada barbeiro (opcional)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de barbeiro */}
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecione um barbeiro" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {barbers?.filter(barber => barber.status === 'ativo').map(barber => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBarber && (
              <>
                {/* Formulário para adicionar novo horário do barbeiro */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-700 rounded-lg">
                  <Select
                    value={newBarberHour.day_of_week.toString()}
                    onValueChange={(value) => setNewBarberHour({...newBarberHour, day_of_week: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="time"
                    value={newBarberHour.start_time}
                    onChange={(e) => setNewBarberHour({...newBarberHour, start_time: e.target.value})}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                  
                  <Input
                    type="time"
                    value={newBarberHour.end_time}
                    onChange={(e) => setNewBarberHour({...newBarberHour, end_time: e.target.value})}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                  
                  <Input
                    type="number"
                    value={newBarberHour.interval_minutes}
                    onChange={(e) => setNewBarberHour({...newBarberHour, interval_minutes: parseInt(e.target.value)})}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Intervalo (min)"
                  />
                  
                  <Button onClick={addBarberHour} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de horários do barbeiro */}
                <div className="space-y-2">
                  {barberHours.map((hour, index) => (
                    <div key={hour.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-700 rounded-lg">
                      <Select
                        value={hour.day_of_week.toString()}
                        onValueChange={(value) => updateBarberHour(index, 'day_of_week', parseInt(value))}
                      >
                        <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="time"
                        value={hour.start_time}
                        onChange={(e) => updateBarberHour(index, 'start_time', e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                      
                      <Input
                        type="time"
                        value={hour.end_time}
                        onChange={(e) => updateBarberHour(index, 'end_time', e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                      
                      <Input
                        type="number"
                        value={hour.interval_minutes}
                        onChange={(e) => updateBarberHour(index, 'interval_minutes', parseInt(e.target.value))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                      
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="checkbox"
                          checked={hour.is_active}
                          onChange={(e) => updateBarberHour(index, 'is_active', e.target.checked)}
                          className="rounded"
                        />
                        <span>Ativo</span>
                      </label>
                      
                      <Button
                        onClick={() => removeBarberHour(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveBarberHours}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Horários do Barbeiro'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}