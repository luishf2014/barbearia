'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
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

  // Buscar agendamentos
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

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

      if (error) throw error

      setAppointments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  // Criar agendamento
  const createAppointment = async (appointmentData: Omit<AppointmentInsert, 'id' | 'created_at'>) => {
    try {
      setError(null)

      // Verificar se o horário está disponível
      const { data: existingAppointment } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', appointmentData.barber_id)
        .eq('data', appointmentData.data)
        .eq('hora', appointmentData.hora)
        .eq('status', 'agendado')
        .single()

      if (existingAppointment) {
        throw new Error('Este horário já está ocupado')
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          *,
          barber:barbers(*),
          cliente:users(nome, email)
        `)
        .single()

      if (error) throw error

      // Atualizar lista local
      setAppointments(prev => [...prev, data])
      
      return { data, error: null }
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
      // Horários de funcionamento
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

      // Buscar TODOS os agendamentos e filtrar no código
      const { data: allAppointments, error } = await supabase
        .from('appointments')
        .select('hora, barber_id, data, status')
      
      console.log('Todos os agendamentos:', { allAppointments, error })
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        // Se houver erro, assumir que todos os horários estão disponíveis
        return availableHours.map((hour: string) => ({
          time: hour,
          isAvailable: true
        }))
      }

      // Filtrar agendamentos para o barbeiro e data específicos
      const bookedSlots = allAppointments?.filter(appointment => 
        appointment.barber_id === barberId && 
        appointment.data === date && 
        appointment.status === 'agendado'
      ) || []
      
      console.log('Agendamentos filtrados:', bookedSlots)
      
      const bookedHours = bookedSlots.map(slot => slot.hora)
      
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
      // Horários de funcionamento
      const workingHours = {
        weekday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                 '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                 '16:00', '16:30', '17:00', '17:30'],
        saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
        sunday: [] // Fechado
      }

      const dayOfWeek = new Date(date).getDay()
      let allHours: string[] = []

      if (dayOfWeek === 0) { // Domingo
        allHours = workingHours.sunday
      } else if (dayOfWeek === 6) { // Sábado
        allHours = workingHours.saturday
      } else { // Segunda a Sexta
        allHours = workingHours.weekday
      }

      // Buscar horários ocupados (agendados) do banco de dados
      console.log('Buscando agendamentos para:', { barberId, date })
      
      // Tentar buscar com RPC para contornar RLS
      let bookedSlots, error
      
      try {
        console.log('🔍 Buscando horários ocupados para:', { barberId, date })
        
        // Primeiro tentar com RPC se existir
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_booked_slots', { p_barber_id: barberId, p_appointment_date: date })
        
        console.log('📡 Resultado RPC:', { rpcData, rpcError })
        
        if (!rpcError && rpcData) {
          // A função RPC agora retorna {hora: string}[] ao invés de appointments completos
          bookedSlots = rpcData.map((slot: {hora: string}) => ({
            hora: slot.hora,
            status: 'agendado'
          }))
          error = null
          console.log('✅ Usando RPC get_booked_slots:', { rpcData, bookedSlots })
        } else {
          console.log('⚠️ RPC falhou, usando query direta. Erro RPC:', rpcError)
          
          // Fallback para query direta
          const { data: directData, error: directError } = await supabase
            .from('appointments')
            .select('*')
            .eq('barber_id', barberId)
            .eq('data', date)
            .eq('status', 'agendado')
          
          console.log('📊 Resultado query direta:', { directData, directError })
          
          bookedSlots = directData
          error = directError
          console.log('🔄 Usando query direta:', { bookedSlots, error })
        }
      } catch (err) {
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
    } catch (err) {
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