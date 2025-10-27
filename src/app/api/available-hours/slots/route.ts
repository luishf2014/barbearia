import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');
    const date = searchParams.get('date');
    
    if (!barberId || !date) {
      return NextResponse.json(
        { error: 'ID do barbeiro e data são obrigatórios' },
        { status: 400 }
      );
    }

    // Converter a data para dia da semana (0 = domingo, 1 = segunda, ...)
    const dayOfWeek = new Date(date).getDay();
    
    try {
      // Primeiro tenta usar a função RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_barber_availability', { 
          p_barber_id: barberId, 
          p_date: date 
        });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return NextResponse.json(rpcData);
      }

      // Se a RPC falhar ou não retornar dados, busca os horários disponíveis para o dia da semana
      const { data: availableHours, error } = await supabase
        .from('available_hours')
        .select('*')
        .eq('barber_id', barberId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;

      if (!availableHours || availableHours.length === 0) {
        // Se não houver configuração para este dia, retorna array vazio
        return NextResponse.json([]);
      }

      // Gerar slots com base nas configurações
      const slots: string[] = [];
      
      for (const config of availableHours) {
        const { start_time, end_time, interval_minutes } = config;
        
        // Converter horários para minutos para facilitar o cálculo
        const [startHour, startMinute] = start_time.split(':').map(Number);
        const [endHour, endMinute] = end_time.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        // Gerar slots
        for (let mins = startMinutes; mins < endMinutes; mins += interval_minutes) {
          const hour = Math.floor(mins / 60);
          const minute = mins % 60;
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeSlot);
        }
      }

      // Buscar agendamentos para esta data e barbeiro
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('data', date)
        .eq('status', 'agendado');

      if (appointmentsError) throw appointmentsError;

      // Filtrar slots ocupados
      const bookedSlots = appointments?.map(app => app.hora) || [];
      const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

      return NextResponse.json(availableSlots);
      
    } catch (rpcError) {
      console.error('Erro ao buscar disponibilidade:', rpcError);
      
      // Fallback para horários padrão
      const workingHours = {
        0: [], // Domingo - fechado
        1: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
            '16:00', '16:30', '17:00', '17:30'], // Segunda a sexta
        2: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
            '16:00', '16:30', '17:00', '17:30'],
        3: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
            '16:00', '16:30', '17:00', '17:30'],
        4: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
            '16:00', '16:30', '17:00', '17:30'],
        5: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
            '16:00', '16:30', '17:00', '17:30'],
        6: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'], // Sábado
      };
      
      const defaultSlots = workingHours[dayOfWeek as keyof typeof workingHours] || [];
      
      // Buscar agendamentos para esta data e barbeiro
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('data', date)
        .eq('status', 'agendado');

      if (appointmentsError) {
        // Se falhar ao buscar agendamentos, retorna os slots padrão
        return NextResponse.json(defaultSlots);
      }

      // Filtrar slots ocupados
      const bookedSlots = appointments?.map(app => app.hora) || [];
      const availableSlots = defaultSlots.filter(slot => !bookedSlots.includes(slot));

      return NextResponse.json(availableSlots);
    }
  } catch (_error) {
    console.error('Erro na API de slots:', _error);
    return NextResponse.json(
      { error: 'Erro ao buscar slots disponíveis' },
      { status: 500 }
    );
  }
}