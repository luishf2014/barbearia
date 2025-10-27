'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from './useAuth'

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type Barber = Database['public']['Tables']['barbers']['Row']

export interface AppointmentWithDetails extends Appointment {
  service_id?: string
  preco?: number
  barber?: {
    id: string
    nome: string
    status: string
  }
  cliente?: {
    nome: string
    email: string
  }
}

// Cache global para agendamentos
let appointmentsCache: {
  data: AppointmentWithDetails[]
  timestamp: number
  userId: string | null
  isAdmin: boolean
} | null = null

const CACHE_TTL = 2 * 60 * 1000 // 2 minutos
const MAX_RETRIES = 3
const INITIAL_BACKOFF = 500
const MAX_BACKOFF = 5000

// Função utilitária para retry com backoff exponencial
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = MAX_RETRIES,
  initialBackoff = INITIAL_BACKOFF
): Promise<T> => {
  let retries = 0
  let backoff = initialBackoff

  while (retries <= maxRetries) {
    try {
      return await operation()
    } catch (error: any) {
      if (retries === maxRetries || !error?.message?.includes('rate limit')) {
        throw error
      }
      
      retries++
      await new Promise(resolve => setTimeout(resolve, backoff))
      backoff = Math.min(backoff * 2, MAX_BACKOFF)
    }
  }
  
  throw new Error('Max retries exceeded')
}

export function useAppointments() {
  const { user, isAdmin } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar agendamentos com cache e retry otimizado
  const fetchAppointments = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const now = Date.now()
      const userId = user?.id || null
      
      // Debug logs
      console.log('🔍 DEBUG useAppointments fetchAppointments:', {
        user: user?.id || 'não logado',
        isAdmin,
        userId,
        forceRefresh
      });
      
      // Verificar cache
      if (!forceRefresh && appointmentsCache && 
          (now - appointmentsCache.timestamp) < CACHE_TTL &&
          appointmentsCache.userId === userId &&
          appointmentsCache.isAdmin === isAdmin) {
        console.log('📦 Usando cache de agendamentos');
        setAppointments(appointmentsCache.data)
        setLoading(false)
        return appointmentsCache.data
      }

      // Buscar dados com retry
      const data = await retryWithBackoff(async () => {
        let query = supabase
          .from('appointments')
          .select(`
            id, data, hora, status, cliente_id, barber_id, created_at, service_id, preco,
            barber:barbers(id, nome, status),
            cliente:users(nome, email)
          `)
          .order('data', { ascending: true })
          .order('hora', { ascending: true })

        if (!isAdmin && user) {
          console.log('🔍 Filtrando por cliente_id:', user.id);
          query = query.eq('cliente_id', user.id)
        } else {
          console.log('🔍 Buscando todos os agendamentos (admin ou sem usuário)');
        }

        const { data, error } = await query
        console.log('📊 Resultado da query:', { data: data?.length || 0, error });
        if (error) throw error
        return data || []
      })

      // Transformar dados para o formato correto
       const transformedData = data.map((appointment: any) => ({
         ...appointment,
         barber: appointment.barber?.[0] ? {
           id: appointment.barber[0].id,
           nome: appointment.barber[0].nome,
           status: 'ativo' // Valor padrão já que não existe na tabela barbers
         } : undefined,
         cliente: appointment.cliente?.[0] ? {
           nome: appointment.cliente[0].nome,
           email: appointment.cliente[0].email
         } : undefined
       }))

      // Atualizar cache
      appointmentsCache = {
        data: transformedData,
        timestamp: now,
        userId,
        isAdmin
      }
      
      setAppointments(transformedData)
      return transformedData
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos'
      setError(errorMessage)
      console.error('Erro ao buscar agendamentos:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin])

  // Criar agendamento otimizado
  const createAppointment = useCallback(async (appointmentData: Omit<AppointmentInsert, 'id' | 'created_at'>) => {
    try {
      setError(null)

      // 1) Tentar criar via RPC com validações no banco (preço, duração, conflito)
      const { data: rpcData, error: rpcError } = await supabase.rpc('save_client_appointment', {
        p_cliente_id: appointmentData.cliente_id,
        p_barber_id: appointmentData.barber_id,
        p_service_id: appointmentData.service_id || null,
        p_date: appointmentData.data,
        p_time: appointmentData.hora,
        p_status: appointmentData.status || 'agendado'
      })

      if (!rpcError && rpcData) {
        // Refetch para trazer relações e manter consistência de cache
        await fetchAppointments(true)
        appointmentsCache = null
        return { data: rpcData?.[0] ?? null, error: null }
      }

      // 2) Fallback seguro para inserção direta caso RPC não exista ou falhe
      console.warn('RPC save_client_appointment indisponível, usando fallback:', rpcError?.message)

      // Verificar disponibilidade (fallback)
      const existingAppointment = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('appointments')
          .select('id')
          .eq('barber_id', appointmentData.barber_id)
          .eq('data', appointmentData.data)
          .eq('hora', appointmentData.hora)
          .eq('status', 'agendado')
          .single()

        if (error?.code === 'PGRST116') {
          return null // Horário disponível
        }
        if (error) throw error
        return data
      })
      
      if (existingAppointment) {
        throw new Error('Este horário já está ocupado')
      }
      
      // Criar agendamento (fallback)
      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select(`
            id, data, hora, status, cliente_id, barber_id, created_at,
            barber:barbers(id, nome, status),
            cliente:users(nome, email)
          `)
          .single()

        if (error) throw error
        return data
      })

      // Transformar dados para o formato correto
      const transformedData = {
        ...data,
        barber: data.barber?.[0] ? {
          id: data.barber[0].id,
          nome: data.barber[0].nome,
          status: 'ativo'
        } : undefined,
        cliente: data.cliente?.[0] ? {
          nome: data.cliente[0].nome,
          email: data.cliente[0].email
        } : undefined
      }

      // Atualizar estado e invalidar cache
      setAppointments(prev => [...prev, transformedData])
      appointmentsCache = null
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento'
      setError(errorMessage)
      console.error('Erro ao criar agendamento:', err)
      return { data: null, error: errorMessage }
    }
  }, [fetchAppointments])

  // Cancelar agendamento
  const cancelAppointment = async (appointmentId: string) => {
    try {
      setError(null)

      // Atualização otimista - atualizar a interface imediatamente
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'cancelado' } : apt)
      )

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelado' })
        .eq('id', appointmentId)
        .select(`
          *,
          barber:barbers(id, nome, status),
          cliente:users(nome, email)
        `)
        .single()

      if (error) {
        // Reverter a atualização otimista em caso de erro
        setAppointments(prev => 
          prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'agendado' } : apt)
        )
        throw error
      }

      // Transformar dados para o formato correto
      const transformedData = {
        ...data,
        barber: data.barber?.[0] ? {
          id: data.barber[0].id,
          nome: data.barber[0].nome,
          status: 'ativo'
        } : undefined,
        cliente: data.cliente?.[0] ? {
          nome: data.cliente[0].nome,
          email: data.cliente[0].email
        } : undefined
      }

      // Atualizar com os dados corretos do servidor
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? transformedData : apt)
      )

      // Invalidar cache para próximas consultas
      appointmentsCache = null
      
      return { data: transformedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Horários padrão memoizados
  const workingHours = useMemo(() => ({
    weekday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
             '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
             '16:00', '16:30', '17:00', '17:30'],
    saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
              '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
    sunday: [] // Fechado
  }), [])

  // Buscar horários disponíveis otimizado
  const getAvailableSlots = useCallback(async (date: string, barberId: string) => {
    try {
      // Tentar RPC primeiro
      try {
        const { data: availableHoursData, error } = await supabase
          .rpc('get_barber_availability', { 
            p_barber_id: barberId, 
            p_date: date 
          })
        
        if (!error && availableHoursData?.length > 0) {
          return availableHoursData
        }
      } catch {
        // Continuar com método alternativo
      }
      
      // Método alternativo otimizado
      const dayOfWeek = new Date(date).getDay()
      let availableHours: string[]

      if (dayOfWeek === 0) {
        availableHours = workingHours.sunday
      } else if (dayOfWeek === 6) {
        availableHours = workingHours.saturday
      } else {
        availableHours = workingHours.weekday
      }

      // Buscar agendamentos com retry
      const bookedAppointments = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('appointments')
          .select('hora')
          .eq('barber_id', barberId)
          .eq('data', date)
          .eq('status', 'agendado')
        
        if (error) throw error
        return data || []
      })

      const bookedHours = bookedAppointments.map(slot => slot.hora)
      return availableHours.filter(hour => !bookedHours.includes(hour))
    } catch (err) {
      console.error('Erro ao buscar horários disponíveis:', err)
      return []
    }
  }, [workingHours])

  // Buscar todos os horários com status otimizado
  const getAllSlotsWithStatus = useCallback(async (date: string, barberId: string) => {
    try {
      let allHours: string[] = []
      
      // Tentar API primeiro
      try {
        const response = await fetch(`/api/available-hours/slots?date=${date}&barber_id=${barberId}`)
        if (response.ok) {
          const apiData = await response.json()
          if (apiData?.length > 0) {
            allHours = apiData
          }
        }
      } catch {
        // Continuar com RPC
      }
      
      // Se API falhou, tentar RPC
      if (allHours.length === 0) {
        try {
          const { data, error } = await supabase
            .rpc('get_barber_availability', { 
              p_barber_id: barberId, 
              p_date: date 
            })
          
          if (!error && data?.length > 0) {
            allHours = data
          }
        } catch {
          // Usar horários padrão
        }
      }
      
      // Fallback para horários padrão
      if (allHours.length === 0) {
        const dayOfWeek = new Date(date).getDay()
        if (dayOfWeek === 0) {
          allHours = workingHours.sunday
        } else if (dayOfWeek === 6) {
          allHours = workingHours.saturday
        } else {
          allHours = workingHours.weekday
        }
      }

      // Buscar horários ocupados com retry
      let bookedHours: string[] = []
      
      try {
        const bookedSlots = await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('appointments')
            .select('hora')
            .eq('barber_id', barberId)
            .eq('data', date)
            .in('status', ['agendado', 'confirmado', 'pendente'])
          
          if (error) throw error
          return data || []
        })
        
        bookedHours = bookedSlots.map(slot => slot.hora)
      } catch (err) {
        console.error('Erro ao buscar agendamentos:', err)
        // Em caso de erro, assumir todos disponíveis
      }
      
      return allHours.map(hour => ({
        time: hour,
        isAvailable: !bookedHours.includes(hour)
      }))
    } catch (err) {
      console.error('Erro ao buscar horários com status:', err)
      return []
    }
  }, [workingHours])

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
  }, [user, isAdmin, fetchAppointments])

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