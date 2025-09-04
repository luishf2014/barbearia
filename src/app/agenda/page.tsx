'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBarbers } from '@/hooks/useBarbers';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Scissors, Calendar, Clock, User, CheckCircle } from 'lucide-react';

type Barber = Database['public']['Tables']['barbers']['Row'];

export default function AgendaPage() {
  const { barbers } = useBarbers();
  const { user } = useAuth();
  const { createAppointment, getAllSlotsWithStatus } = useAppointments();
  
  console.log('🏪 Página Agenda carregada:', { barbers, user });
  
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [allSlots, setAllSlots] = useState<{time: string, isAvailable: boolean}[]>([]);
  const [loading, setLoading] = useState(false);

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    console.log('🔄 useEffect disparado:', { selectedBarber, selectedDate });
    if (selectedBarber && selectedDate) {
      console.log('✅ Barbeiro e data selecionados, buscando horários...');
      const fetchSlots = async () => {
        const allSlotsWithStatus = await getAllSlotsWithStatus(selectedDate, selectedBarber.id);
        console.log('📋 Horários recebidos:', allSlotsWithStatus);
        setAllSlots(allSlotsWithStatus);
      };
      fetchSlots();
    } else {
      console.log('⚠️ Barbeiro ou data não selecionados ainda');
    }
  }, [selectedBarber, selectedDate, getAllSlotsWithStatus]);

  const handleSchedule = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer um agendamento');
      return;
    }

    if (!selectedBarber || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const result = await createAppointment({
        barber_id: selectedBarber.id,
        cliente_id: user.id,
        data: selectedDate,
        hora: selectedTime,
        status: 'agendado'
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      // Atualizar horários disponíveis após criar agendamento
        if (selectedBarber && selectedDate) {
          const updatedAllSlots = await getAllSlotsWithStatus(selectedDate, selectedBarber.id);
          setAllSlots(updatedAllSlots);
        }
      
      // Reset form
      setSelectedBarber(null);
      setSelectedDate('');
      setSelectedTime('');
      toast.success('Agendamento realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-white rounded-full p-3">
              <Scissors className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald">
              AGENDAR HORÁRIO
            </h1>
          </div>
          <p className="text-xl text-white/80 mb-8">
            Reserve seu horário na Camisa 10 Barbearia em 3 passos simples
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              selectedBarber ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
            }`}>
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">1. Barbeiro</span>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              selectedDate ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
            }`}>
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">2. Data</span>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              selectedTime ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">3. Horário</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white rounded-full p-2">
                <User className="h-6 w-6 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white font-oswald">ESCOLHA SEU BARBEIRO</h2>
            </div>
            <p className="text-white/70 mb-8">Selecione o profissional de sua preferência</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers?.filter(b => b.status === 'ativo').map(barber => (
                <div
                  key={barber.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedBarber?.id === barber.id 
                      ? 'transform scale-105' 
                      : 'hover:transform hover:scale-102'
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedBarber?.id === barber.id
                      ? 'bg-white border-white text-slate-900 shadow-2xl'
                      : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                  }`}>
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
                        selectedBarber?.id === barber.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/10 text-white/70'
                      }`}>
                        ✂️
                      </div>
                      <h3 className="text-lg font-bold font-oswald mb-2">{barber.nome}</h3>
                      <p className={`text-sm ${
                        selectedBarber?.id === barber.id
                          ? 'text-slate-600'
                          : 'text-white/60'
                      }`}>
                        Barbeiro Profissional
                      </p>
                    </div>
                    {selectedBarber?.id === barber.id && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedBarber && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white rounded-full p-2">
                  <Calendar className="h-6 w-6 text-slate-900" />
                </div>
                <h2 className="text-2xl font-bold text-white font-oswald">ESCOLHA A DATA</h2>
              </div>
              <p className="text-white/70 mb-8">Selecione o dia que melhor se adequa à sua agenda</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {nextSevenDays.map(date => {
                  const isSelected = selectedDate === date;
                  const dateObj = parseISO(date);
                  const isToday = date === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div
                      key={date}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        isSelected ? 'transform scale-105' : 'hover:transform hover:scale-102'
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime('');
                      }}
                    >
                      <div className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-white border-white text-slate-900 shadow-2xl'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }`}>
                        <div className={`text-xs font-medium mb-1 uppercase ${
                          isSelected ? 'text-slate-600' : 'text-white/60'
                        }`}>
                          {format(dateObj, 'EEE', { locale: ptBR })}
                        </div>
                        <div className={`text-2xl font-bold font-oswald mb-1 ${
                          isSelected ? 'text-slate-900' : 'text-white'
                        }`}>
                          {format(dateObj, 'd')}
                        </div>
                        <div className={`text-xs uppercase ${
                          isSelected ? 'text-slate-600' : 'text-white/60'
                        }`}>
                          {format(dateObj, 'MMM', { locale: ptBR })}
                        </div>
                        {isToday && (
                          <div className={`text-xs mt-1 font-medium ${
                            isSelected ? 'text-slate-700' : 'text-white/80'
                          }`}>
                            HOJE
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDate && allSlots.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white rounded-full p-2">
                  <Clock className="h-6 w-6 text-slate-900" />
                </div>
                <h2 className="text-2xl font-bold text-white font-oswald">ESCOLHA O HORÁRIO</h2>
              </div>
              <p className="text-white/70 mb-8">
                Horários para {format(parseISO(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allSlots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  const isAvailable = slot.isAvailable;
                  
                  return (
                    <div
                      key={slot.time}
                      className={`relative transition-all duration-300 ${
                        isAvailable 
                          ? `cursor-pointer ${
                              isSelected ? 'transform scale-105' : 'hover:transform hover:scale-102'
                            }`
                          : 'cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => isAvailable && setSelectedTime(slot.time)}
                    >
                      <div className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                        !isAvailable
                          ? 'bg-slate-600/50 border-slate-500/50 text-white/50'
                          : isSelected
                            ? 'bg-white border-white text-slate-900 shadow-2xl'
                            : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }`}>
                        <div className={`flex items-center justify-center space-x-2 ${
                          !isAvailable
                            ? 'text-white/50'
                            : isSelected 
                              ? 'text-slate-900' 
                              : 'text-white'
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-lg font-bold font-oswald">{slot.time}</span>
                        </div>
                        {!isAvailable && (
                          <div className="text-xs mt-1 text-white/40 font-medium">
                            OCUPADO
                          </div>
                        )}
                      </div>
                      {isSelected && isAvailable && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDate && allSlots.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="bg-slate-700 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-white/60" />
                </div>
                <h3 className="text-xl font-bold text-white font-oswald mb-2">HORÁRIOS INDISPONÍVEIS</h3>
                <p className="text-white/70">
                  Não há horários disponíveis para {format(parseISO(selectedDate), "dd 'de' MMMM", { locale: ptBR })}.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Tente selecionar outra data ou entre em contato conosco.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTime && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-3 mb-4">
                  <div className="bg-green-500 rounded-full p-3">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white font-oswald">CONFIRMAR AGENDAMENTO</h2>
                </div>
                <p className="text-white/70 text-lg">Revise os detalhes do seu agendamento</p>
              </div>
              
              <div className="bg-slate-700/50 rounded-2xl p-6 mb-8 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-600/50">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-white/60" />
                    <span className="text-white/60 font-medium">Barbeiro</span>
                  </div>
                  <span className="text-white font-bold text-lg">{selectedBarber?.nome}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-600/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-white/60" />
                    <span className="text-white/60 font-medium">Data</span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    {format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-white/60" />
                    <span className="text-white/60 font-medium">Horário</span>
                  </div>
                  <span className="text-white font-bold text-lg">{selectedTime}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleSchedule} 
                className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-slate-900 font-bold text-lg py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                size="lg"
                disabled={loading}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Scissors className="h-6 w-6" />
                  <span className="font-oswald text-xl">{loading ? 'AGENDANDO...' : 'CONFIRMAR AGENDAMENTO'}</span>
                </div>
              </Button>
              
              <p className="text-center text-white/50 text-sm mt-4">
                Você receberá uma confirmação por WhatsApp
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-white rounded-full p-2">
                <Scissors className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-white font-oswald">CAMISA 10 BARBEARIA</h3>
            </div>
            <p className="text-white/70 mb-4">
              Tradição e qualidade em cada corte
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-white/60">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>Rua das Flores, 123 - Centro</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🕒</span>
                <span>Seg-Sáb: 8h às 18h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}