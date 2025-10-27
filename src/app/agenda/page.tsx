'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBarbers } from '@/hooks/useBarbers';
import { useAuth } from '@/hooks/useAuth';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useSchedule } from '@/hooks/useSchedule';
import { useSimpleData } from '@/hooks/useSimpleData';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Scissors, Calendar, Clock, User, CheckCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Barber = Database['public']['Tables']['barbers']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

export default function AgendaPage() {
  // Teste básico de useEffect
  useEffect(() => {
    console.log('🧪 TESTE: useEffect da página executado!')
    console.log('🧪 TESTE: Timestamp:', new Date().toISOString())
  }, [])

  const { barbers } = useBarbers();
  const { user, loading: authLoading } = useAuth();
  const { services } = useServices();
  const { appointments, createAppointment } = useAppointments();
  const { getAvailableSlots } = useSchedule();
  const router = useRouter();
  
  // Hook simplificado para teste
  const { barbers: simpleBarbers, services: simpleServices, loading: simpleLoading, error: simpleError } = useSimpleData();
  
  console.log('🏪 Página Agenda carregada:', { 
    barbers: barbers?.length || 0, 
    user: user?.id || 'null', 
    services: services?.length || 0,
    barbersData: barbers,
    servicesData: services
  });
  
  console.log('🔧 Hook simplificado:', {
    simpleBarbers: simpleBarbers?.length || 0,
    simpleServices: simpleServices?.length || 0,
    simpleLoading,
    simpleError,
    simpleBarbersData: simpleBarbers,
    simpleServicesData: simpleServices
  });
  
  // Usar dados do hook simplificado temporariamente
  const finalBarbers = simpleBarbers.length > 0 ? simpleBarbers : barbers;
  const finalServices = simpleServices.length > 0 ? simpleServices : services;
  
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [allSlots, setAllSlots] = useState<{time_slot: string, is_available: boolean}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    console.log('🔄 useEffect disparado:', { selectedBarber, selectedDate });
    if (selectedBarber && selectedDate) {
      console.log('✅ Barbeiro e data selecionados, buscando horários...');
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true);
          setAllSlots([]); // Limpar horários anteriores
          const allSlotsWithStatus = await getAvailableSlots(selectedBarber.id, selectedDate);
          console.log('📋 Horários recebidos:', allSlotsWithStatus);
          setAllSlots(allSlotsWithStatus);
        } catch (error) {
          console.error('❌ Erro ao buscar horários:', error);
          setAllSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      console.log('⚠️ Barbeiro ou data não selecionados ainda');
      setAllSlots([]);
      setLoadingSlots(false);
    }
  }, [selectedBarber, selectedDate, getAvailableSlots]);

  const handleSchedule = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer um agendamento');
      return;
    }

    // Validações mais detalhadas
    if (!selectedBarber) {
      toast.error('Por favor, selecione um barbeiro');
      return;
    }

    if (!selectedService) {
      toast.error('Por favor, selecione um serviço');
      return;
    }

    if (!selectedDate) {
      toast.error('Por favor, selecione uma data');
      return;
    }

    if (!selectedTime) {
      toast.error('Por favor, selecione um horário');
      return;
    }

    // Verificar se o horário ainda está disponível
    const selectedSlot = allSlots.find(slot => slot.time_slot === selectedTime);
    if (!selectedSlot || !selectedSlot.is_available) {
      toast.error('Este horário não está mais disponível. Por favor, selecione outro horário.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Iniciando criação do agendamento:', {
        cliente_id: user.id,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        data: selectedDate,
        hora: selectedTime,
        status: 'agendado'
      });

      const result = await createAppointment({
        cliente_id: user.id,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        data: selectedDate,
        hora: selectedTime,
        status: 'agendado',
        preco: selectedService.preco
      });

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Agendamento criado com sucesso:', result.data);
      
      toast.success(`Agendamento realizado com sucesso! 
        Barbeiro: ${selectedBarber.nome}
        Serviço: ${selectedService.nome}
        Data: ${format(parseISO(selectedDate), "dd/MM/yyyy", { locale: ptBR })}
        Horário: ${selectedTime}`);
      
      // Reset form
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setAllSlots([]);
      
      // Redirect to meus agendamentos page
      setTimeout(() => {
        router.push('/meus-agendamentos');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('já está ocupado')) {
        toast.error('Este horário já foi agendado por outro cliente. Por favor, escolha outro horário.');
      } else if (errorMessage.includes('não encontrado')) {
        toast.error('Dados inválidos. Por favor, verifique as informações selecionadas.');
      } else {
        toast.error(`Erro ao realizar agendamento: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-3">
              <Scissors className="h-6 w-6 md:h-8 md:w-8 text-slate-900" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-oswald">AGENDAR HORÁRIO</h1>
          </div>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Escolha seu barbeiro, serviço e horário preferido para um atendimento personalizado
          </p>
        </div>

        {/* Seleção de Barbeiro */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className="bg-white rounded-full p-2">
                <User className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-oswald">ESCOLHA SEU BARBEIRO</h2>
            </div>
            <p className="text-white/70 mb-6 md:mb-8 text-sm md:text-base">Selecione o profissional de sua preferência</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {finalBarbers?.filter(b => b.status === 'ativo').map(barber => (
                <div
                  key={barber.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedBarber?.id === barber.id 
                      ? 'transform scale-105' 
                      : 'hover:transform hover:scale-102'
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedBarber?.id === barber.id
                      ? 'bg-white border-white text-slate-900 shadow-2xl'
                      : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                  }`}>
                    <div className="text-center">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-xl md:text-2xl ${
                        selectedBarber?.id === barber.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/10 text-white/70'
                      }`}>
                        ✂️
                      </div>
                      <h3 className="text-base md:text-lg font-bold font-oswald mb-1 md:mb-2">{barber.nome}</h3>
                      <p className={`text-xs md:text-sm mb-2 ${
                        selectedBarber?.id === barber.id
                          ? 'text-slate-600'
                          : 'text-white/60'
                      }`}>
                        Barbeiro Profissional
                      </p>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              selectedBarber?.id === barber.id
                                ? 'text-yellow-500'
                                : 'text-yellow-400'
                            }`}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                      <div className={`text-xs ${
                        selectedBarber?.id === barber.id
                          ? 'text-slate-600'
                          : 'text-white/60'
                      }`}>
                        Especialista em cortes modernos
                      </div>
                    </div>
                    {selectedBarber?.id === barber.id && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
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
             <CardContent className="p-4 md:p-8">
               <div className="flex items-center space-x-3 mb-4 md:mb-6">
                 <div className="bg-white rounded-full p-2">
                   <Star className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
                 </div>
                 <h2 className="text-xl md:text-2xl font-bold text-white font-oswald">ESCOLHA O SERVIÇO</h2>
               </div>
               <p className="text-white/70 mb-6 md:mb-8 text-sm md:text-base">Selecione o serviço desejado</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                 {finalServices?.map(service => (
                   <div
                     key={service.id}
                     className={`relative group cursor-pointer transition-all duration-300 ${
                       selectedService?.id === service.id 
                         ? 'transform scale-105' 
                         : 'hover:transform hover:scale-102'
                     }`}
                     onClick={() => setSelectedService(service)}
                   >
                     <div className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 ${
                       selectedService?.id === service.id
                         ? 'bg-white border-white text-slate-900 shadow-2xl'
                         : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                     }`}>
                       <div className="text-center">
                         <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-xl md:text-2xl ${
                           selectedService?.id === service.id
                             ? 'bg-slate-900 text-white'
                             : 'bg-white/10 text-white/70'
                         }`}>
                           ✨
                         </div>
                         <h3 className="text-base md:text-lg font-bold font-oswald mb-1 md:mb-2">{service.nome}</h3>
                         <p className={`text-xs md:text-sm mb-2 ${
                           selectedService?.id === service.id
                             ? 'text-slate-600'
                             : 'text-white/60'
                         }`}>
                           {service.descricao || 'Serviço profissional'}
                         </p>
                         <div className={`text-lg md:text-xl font-bold ${
                           selectedService?.id === service.id
                             ? 'text-slate-900'
                             : 'text-white'
                         }`}>
                           R$ {service.preco?.toFixed(2)}
                         </div>
                       </div>
                       {selectedService?.id === service.id && (
                         <div className="absolute -top-2 -right-2">
                           <div className="bg-green-500 rounded-full p-1">
                             <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        )}

        {/* Seleção de Data */}
        {selectedBarber && selectedService && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-4 md:p-8">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="bg-white rounded-full p-2">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white font-oswald">ESCOLHA A DATA</h2>
              </div>
              <p className="text-white/70 mb-6 md:mb-8 text-sm md:text-base">Selecione o dia do seu agendamento</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
                {nextSevenDays.map(date => {
                  const dateObj = parseISO(date);
                  const isSelected = selectedDate === date;
                  
                  return (
                    <div
                      key={date}
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'transform scale-105' 
                          : 'hover:transform hover:scale-102'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`p-3 md:p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-white border-white text-slate-900 shadow-2xl'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }`}>
                        <div className={`text-xs md:text-sm font-medium mb-1 ${
                          isSelected ? 'text-slate-600' : 'text-white/60'
                        }`}>
                          {format(dateObj, 'EEE', { locale: ptBR }).toUpperCase()}
                        </div>
                        <div className={`text-lg md:text-xl font-bold ${
                          isSelected ? 'text-slate-900' : 'text-white'
                        }`}>
                          {format(dateObj, 'dd')}
                        </div>
                        <div className={`text-xs md:text-sm ${
                          isSelected ? 'text-slate-600' : 'text-white/60'
                        }`}>
                          {format(dateObj, 'MMM', { locale: ptBR }).toUpperCase()}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1">
                            <div className="bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-2 w-2 md:h-3 md:w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seleção de Horário */}
        {selectedBarber && selectedService && selectedDate && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-4 md:p-8">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="bg-white rounded-full p-2">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white font-oswald">ESCOLHA O HORÁRIO</h2>
              </div>
              <p className="text-white/70 mb-6 md:mb-8 text-sm md:text-base">Selecione o horário disponível</p>
              
              {loadingSlots ? (
                // Loading skeleton para horários
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-slate-600 rounded-xl border-2 border-slate-500 p-3 md:p-4">
                        <div className="h-4 md:h-5 bg-slate-500 rounded mb-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : allSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                  {allSlots.map(slot => {
                    const isSelected = selectedTime === slot.time_slot;
                    const isAvailable = slot.is_available;
                    
                    return (
                      <div
                        key={slot.time_slot}
                        className={`cursor-pointer transition-all duration-300 ${
                          !isAvailable 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isSelected 
                              ? 'transform scale-105' 
                              : 'hover:transform hover:scale-102'
                        }`}
                        onClick={() => isAvailable && setSelectedTime(slot.time_slot)}
                      >
                        <div className={`p-3 md:p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                          !isAvailable
                            ? 'bg-slate-600 border-slate-500 text-slate-400'
                            : isSelected
                              ? 'bg-white border-white text-slate-900 shadow-2xl'
                              : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                        }`}>
                          <div className={`text-sm md:text-base font-bold ${
                            !isAvailable
                              ? 'text-slate-400'
                              : isSelected 
                                ? 'text-slate-900' 
                                : 'text-white'
                          }`}>
                            {slot.time_slot}
                          </div>
                          {!isAvailable && (
                            <div className="text-xs text-slate-400 mt-1">
                              Ocupado
                            </div>
                          )}
                          {isSelected && isAvailable && (
                            <div className="absolute -top-1 -right-1">
                              <div className="bg-green-500 rounded-full p-1">
                                <CheckCircle className="h-2 w-2 md:h-3 md:w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/70 text-sm md:text-base">
                    Nenhum horário disponível para esta data.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Estado vazio de Horários - Removido pois agora está integrado na seção principal */}

        {/* Botão de Agendamento */}
        {selectedBarber && selectedService && selectedDate && selectedTime && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-4 md:p-8">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white font-oswald mb-4">CONFIRMAR AGENDAMENTO</h3>
                
                <div className="bg-slate-700 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                    <div className="text-white/70">
                      <span className="font-medium">Barbeiro:</span> {selectedBarber.nome}
                    </div>
                    <div className="text-white/70">
                      <span className="font-medium">Serviço:</span> {selectedService.nome}
                    </div>
                    <div className="text-white/70">
                      <span className="font-medium">Data:</span> {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-white/70">
                      <span className="font-medium">Horário:</span> {selectedTime}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <div className="text-xl md:text-2xl font-bold text-white">
                      Total: R$ {selectedService.preco?.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSchedule}
                  disabled={loading || authLoading || !user}
                  className="w-full md:w-auto bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-8 text-base md:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Agendando...'
                    : !user
                      ? (authLoading ? 'Verificando login...' : 'Entrar para agendar')
                      : 'CONFIRMAR AGENDAMENTO'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}