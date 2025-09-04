'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from './useAuth'

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type Barber = Database['public']['Tables']['barbers']['Row']

export interface AppointmentWithDetails extends Appointment {
  barber?: Barber
  cliente?: {
    nome: string
    email: string
  }
}

export function useAppointments() {
  const { user, isAdmin } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache para armazenar agendamentos
  const [appointmentsCache, setAppointmentsCache] = useState<{
    data: AppointmentWithDetails[] | null,
    timestamp: number,
    userId: string | null,
    isAdmin: boolean
  }>({
    data: null,
    timestamp: 0,
    userId: null,
    isAdmin: false
  });

  // Buscar agendamentos com cache e retry
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar cache (válido por 2 minutos)
      const cacheValidityMs = 2 * 60 * 1000; // 2 minutos
      const now = Date.now();
      const userId = user?.id || null;
      
      // Usar cache se disponível e válido (mesmo usuário e permissões)
      if (appointmentsCache.data && 
          (now - appointmentsCache.timestamp) < cacheValidityMs &&
          appointmentsCache.userId === userId &&
          appointmentsCache.isAdmin === isAdmin) {
        console.log('Usando cache de agendamentos');
        setAppointments(appointmentsCache.data);
        setLoading(false);
        return;
      }

      // Implementar retry com backoff exponencial
      let retries = 0;
      const maxRetries = 3;
      let backoffMs = 500;
      const maxBackoffMs = 10000;
      
      while (retries <= maxRetries) {
        try {
          let query = supabase
            .from('appointments')
            .select(`
              *,
              barber:barbers(*),
              cliente:users(nome, email)
            `)
            .order('data', { ascending: true })
            .order('hora', { ascending: true })

          // Se não for admin, mostrar apenas agendamentos do próprio usuário
          if (!isAdmin && user) {
            query = query.eq('cliente_id', user.id)
          }

          const { data, error } = await query

          if (error) {
            // Se for erro de limite de taxa, tenta novamente
            if (error.message?.includes('rate limit') && retries < maxRetries) {
              retries++;
              console.log(`Rate limit reached. Retrying in ${backoffMs}ms (${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
              backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
              continue;
            }
            throw error;
          }

          // Atualizar cache
          setAppointmentsCache({
            data: data || [],
            timestamp: now,
            userId,
            isAdmin
          });
          
          setAppointments(data || [])
          break;
        } catch (error: unknown) {
        if (retries < maxRetries && error instanceof Error && error.message?.includes('rate limit')) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
            continue;
          }
          throw error;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  // Criar agendamento com retry
  const createAppointment = async (appointmentData: Omit<AppointmentInsert, 'id' | 'created_at'>) => {
    try {
      setError(null)

      // Implementar retry com backoff exponencial
      let retries = 0;
      const maxRetries = 3;
      let backoffMs = 500;
      const maxBackoffMs = 10000;
      
      // Função para verificar disponibilidade com retry
      const checkAvailability = async () => {
        while (retries <= maxRetries) {
          try {
            const { data: existingAppointment, error } = await supabase
              .from('appointments')
              .select('id')
              .eq('barber_id', appointmentData.barber_id)
              .eq('data', appointmentData.data)
              .eq('hora', appointmentData.hora)
              .eq('status', 'agendado')
              .single()

            if (error) {
              // Se for erro de limite de taxa, tenta novamente
              if (error.message?.includes('rate limit') && retries < maxRetries) {
                retries++;
                console.log(`Rate limit reached. Retrying in ${backoffMs}ms (${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
                backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
                continue;
              }
              
              // Se for erro de não encontrado, significa que o horário está disponível
              if (error.code === 'PGRST116') {
                return null;
              }
              
              throw error;
            }

            return existingAppointment;
          } catch (error: unknown) {
          if (retries < maxRetries && error instanceof Error && error.message?.includes('rate limit')) {
              retries++;
              await new Promise(resolve => setTimeout(resolve, backoffMs));
              backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
              continue;
            }
            throw error;
          }
        }
        return null;
      };
      
      // Verificar se o horário está disponível
      const existingAppointment = await checkAvailability();
      
      if (existingAppointment) {
        throw new Error('Este horário já está ocupado')
      }
      
      // Resetar contadores para a próxima operação
      retries = 0;
      backoffMs = 500;
      
      // Criar agendamento com retry
      while (retries <= maxRetries) {
        try {
          const { data, error } = await supabase
            .from('appointments')
            .insert(appointmentData)
            .select(`
              *,
              barber:barbers(*),
              cliente:users(nome, email)
            `)
            .single()

          if (error) {
            // Se for erro de limite de taxa, tenta novamente
            if (error.message?.includes('rate limit') && retries < maxRetries) {
              retries++;
              console.log(`Rate limit reached. Retrying in ${backoffMs}ms (${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
              backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
              continue;
            }
            throw error;
          }

          // Atualizar lista local e cache
          setAppointments(prev => [...prev, data]);
          
          // Invalidar cache de agendamentos para forçar nova busca
          setAppointmentsCache(prev => ({
            ...prev,
            timestamp: 0
          }));
          
          return { data, error: null };
        } catch (error: unknown) {
          if (retries < maxRetries && error instanceof Error && error.message?.includes('rate limit')) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
            continue;
          }
          throw error;
        }
      }
      
      throw new Error('Falha ao criar agendamento após várias tentativas');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Cancelar agendamento
  const cancelAppointment = async (appointmentId: string) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelado' })
        .eq('id', appointmentId)
        .select(`
          *,
          barber:barbers(*),
          cliente:users(nome, email)
        `)
        .single()

      if (error) throw error

      // Atualizar lista local
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? data : apt)
      )
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Buscar horários disponíveis para uma data e barbeiro
  const getAvailableSlots = async (date: string, barberId: string) => {
    try {
      // Tentar usar a função RPC get_barber_availability primeiro
      try {
        const { data: availableHoursData, error: availableHoursError } = await supabase
          .rpc('get_barber_availability', { 
            p_barber_id: barberId, 
            p_date: date 
          })
        
        if (!availableHoursError && availableHoursData && availableHoursData.length > 0) {
          console.log('Usando horários da função RPC:', availableHoursData)
          return availableHoursData
        }
      } catch (rpcErr: unknown) {
        console.log('Erro ao usar RPC get_barber_availability:', rpcErr)
        // Continuar com o método alternativo
      }
      
      // Método alternativo: horários padrão e filtrar agendamentos
      const workingHours = {
        weekday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                 '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                 '16:00', '16:30', '17:00', '17:30'],
        saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
        sunday: [] // Fechado
      }

      const dayOfWeek = new Date(date).getDay()
      let availableHours: string[] = []

      if (dayOfWeek === 0) { // Domingo
        availableHours = workingHours.sunday
      } else if (dayOfWeek === 6) { // Sábado
        availableHours = workingHours.saturday
      } else { // Segunda a Sexta
        availableHours = workingHours.weekday
      }

      // Buscar agendamentos para a data e barbeiro específicos
      const { data: bookedAppointments, error } = await supabase
        .from('appointments')
        .select('hora')
        .eq('barber_id', barberId)
        .eq('data', date)
        .eq('status', 'agendado')
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        // Se houver erro, assumir que todos os horários estão disponíveis
        return availableHours
      }

      // Extrair horários ocupados
      const bookedHours = bookedAppointments?.map(slot => slot.hora) || []
      
      // Filtrar horários disponíveis
      const availableSlots = availableHours.filter(hour => !bookedHours.includes(hour))
      
      return availableSlots
    } catch (err) {
      console.error('Erro ao buscar horários disponíveis:', err)
      return []
    }
  }

  // Buscar todos os horários com status (disponível/ocupado) para uma data e barbeiro
  const getAllSlotsWithStatus = async (date: string, barberId: string) => {
    try {
      // Buscar horários disponíveis da tabela available_hours
      let allHours: string[] = []
      
      try {
        // Primeiro tenta buscar da API
        try {
          const response = await fetch(`/api/available-hours/slots?barber_id=${barberId}&date=${date}`)
          
          if (response.ok) {
            const apiData = await response.json()
            if (apiData && apiData.length > 0) {
              allHours = apiData
              console.log('✅ Usando API de slots:', { allHours })
              // Se a API retornou dados, não precisa tentar a RPC
              throw new Error('Usando dados da API')
            }
          }
        } catch (apiErr: unknown) {
          if (apiErr instanceof Error && apiErr.message === 'Usando dados da API') {
            // Não é um erro real, apenas um controle de fluxo
            console.log('API retornou dados, pulando RPC')
          } else {
            // Se a API falhar, tenta a RPC
            console.log('⚠️ API falhou, tentando RPC:', apiErr)
            
            const { data: availableHoursData, error: availableHoursError } = await supabase
              .rpc('get_barber_availability', { 
                p_barber_id: barberId, 
                p_date: date 
              })
            
            console.log('Horários disponíveis da função:', { availableHoursData, availableHoursError })
            
            if (!availableHoursError && availableHoursData && availableHoursData.length > 0) {
              // Usar os horários retornados pela função
              allHours = availableHoursData
              console.log('Usando horários da tabela available_hours:', allHours)
            } else {
              throw new Error('Função não retornou dados')
            }
          }
        }
      } catch (err: unknown) {
        // Se não for o erro de controle de fluxo e allHours ainda estiver vazio
        if (err instanceof Error && err.message !== 'Usando dados da API' && allHours.length === 0) {
          console.log('Função get_barber_availability falhou ou não retornou dados, usando horários padrão', err)
          // Fallback para horários padrão
          const workingHours = {
            weekday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                     '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                     '16:00', '16:30', '17:00', '17:30'],
            saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
            sunday: [] // Fechado
          }

          const dayOfWeek = new Date(date).getDay()

          if (dayOfWeek === 0) { // Domingo
            allHours = workingHours.sunday
          } else if (dayOfWeek === 6) { // Sábado
            allHours = workingHours.saturday
          } else { // Segunda a Sexta
            allHours = workingHours.weekday
          }
        }
      }

      // Buscar horários ocupados (agendados) do banco de dados
      console.log('Buscando agendamentos para:', { barberId, date })
      
      // Tentar buscar horários ocupados
      let bookedSlots = []
      let error = null
      
      try {
        console.log('🔍 Buscando horários ocupados para:', { barberId, date })
        
        // Tentar buscar diretamente da tabela de agendamentos
        const { data: directData, error: directError } = await supabase
          .from('appointments')
          .select('hora')
          .eq('barber_id', barberId)
          .eq('data', date)
          .in('status', ['agendado', 'confirmado', 'pendente'])
        
        console.log('📊 Resultado query direta:', { directData, directError })
        
        if (!directError && directData) {
          bookedSlots = directData
          error = null
          console.log('✅ Usando query direta:', { bookedSlots })
        } else {
          // Se falhar, tentar com RPC
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('get_booked_slots', { p_barber_id: barberId, p_appointment_date: date })
            
            console.log('📡 Resultado RPC:', { rpcData, rpcError })
            
            if (!rpcError && rpcData) {
              // A função RPC retorna {hora: string}[]
              bookedSlots = rpcData.map((slot: {hora: string}) => ({
                hora: slot.hora,
                status: 'agendado'
              }))
              error = null
              console.log('✅ Usando RPC get_booked_slots:', { rpcData, bookedSlots })
            } else {
              throw rpcError
            }
          } catch (rpcErr: unknown) {
            console.log('⚠️ RPC falhou:', rpcErr)
            // Se a RPC falhar, mas a query direta não retornou erro, usar array vazio
            if (!directError) {
              bookedSlots = []
              console.log('⚙️ Usando array vazio para horários ocupados')
            } else {
              error = directError || rpcErr
            }
          }
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar agendamentos:', err)
        bookedSlots = []
        error = err
      }
      
      console.log('Resultado da query completa:', { bookedSlots, error })
      console.log('Total de agendamentos encontrados:', bookedSlots?.length || 0)
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        // Se houver erro, assumir que todos os horários estão disponíveis
        return allHours.map((hour: string) => ({
          time: hour,
          isAvailable: true
        }))
      }
      
      // Extrair apenas os horários ocupados
      const bookedHours = bookedSlots?.map((slot: { hora: string }) => slot.hora) || []
      
      console.log('Horários ocupados extraídos:', bookedHours)
      
      // Retornar todos os horários com status real
      const slotsWithStatus = allHours.map(hour => ({
        time: hour,
        isAvailable: !bookedHours.includes(hour)
      }))
      
      console.log('Horários com status final:', slotsWithStatus)
      
      return slotsWithStatus
    } catch (err: unknown) {
      console.error('Erro ao buscar horários com status:', err)
      return []
    }
  }

  // Configurar realtime
  useEffect(() => {
    fetchAppointments()

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isAdmin])

  return {
    appointments,
    loading,
    error,
    createAppointment,
    cancelAppointment,
    getAvailableSlots,
    getAllSlotsWithStatus,
    refetch: fetchAppointments
  }
}