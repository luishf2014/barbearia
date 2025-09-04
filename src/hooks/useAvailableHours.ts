'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { useAuth } from './useAuth'

type AvailableHour = Database['public']['Tables']['available_hours']['Row']
type AvailableHourInsert = Database['public']['Tables']['available_hours']['Insert']
type AvailableHourUpdate = Database['public']['Tables']['available_hours']['Update']

export interface DaySchedule {
  dayOfWeek: number
  dayName: string
  slots: {
    id?: string
    startTime: string
    endTime: string
    intervalMinutes: number
    isActive: boolean
  }[]
}

export function useAvailableHours() {
  const { isAdmin } = useAuth()
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar horários disponíveis para um barbeiro
  const fetchBarberAvailableHours = async (barberId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/available-hours?barber_id=${barberId}`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()

      setAvailableHours(data || [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar horários disponíveis'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Criar um novo horário disponível
  const createAvailableHour = async (hourData: AvailableHourInsert) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horários')
      }

      setError(null)

      const response = await fetch('/api/available-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hourData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Atualizar lista local
      setAvailableHours(prev => [...prev, data])

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar horário disponível'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Atualizar um horário disponível
  const updateAvailableHour = async (hourId: string, updates: AvailableHourUpdate) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horários')
      }

      setError(null)

      const response = await fetch('/api/available-hours', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: hourId, ...updates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Atualizar lista local
      setAvailableHours(prev => 
        prev.map(hour => hour.id === hourId ? data : hour)
      )

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar horário disponível'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Excluir um horário disponível
  const deleteAvailableHour = async (hourId: string) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horários')
      }

      setError(null)

      const response = await fetch(`/api/available-hours?id=${hourId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      // Atualizar lista local
      setAvailableHours(prev => prev.filter(hour => hour.id !== hourId))

      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir horário disponível'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Organizar horários por dia da semana
  const getScheduleByDay = (hours: AvailableHour[]): DaySchedule[] => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    // Inicializar array com os 7 dias da semana
    const scheduleByDay: DaySchedule[] = dayNames.map((name, index) => ({
      dayOfWeek: index,
      dayName: name,
      slots: []
    }))

    // Agrupar horários por dia da semana
    hours.forEach(hour => {
      const dayIndex = hour.day_of_week
      
      scheduleByDay[dayIndex].slots.push({
        id: hour.id,
        startTime: hour.start_time,
        endTime: hour.end_time,
        intervalMinutes: hour.interval_minutes,
        isActive: hour.is_active
      })
    })

    return scheduleByDay
  }

  // Obter horários disponíveis para uma data específica
  const getAvailableSlotsForDate = async (barberId: string, date: string) => {
    try {
      setError(null)

      try {
        const { data, error } = await supabase
          .rpc('get_barber_availability', { 
            p_barber_id: barberId, 
            p_date: date 
          })

        if (!error && data && data.length > 0) {
          return data
        }
        
        // Se não houver dados ou ocorrer erro, buscar da API
        const response = await fetch(`/api/available-hours/slots?barber_id=${barberId}&date=${date}`)
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const apiData = await response.json()
        return apiData || []
      } catch (err) {
        console.error('Erro ao buscar horários via RPC:', err)
        
        // Fallback para horários padrão
        const dayOfWeek = new Date(date).getDay()
        const workingHours = {
          weekday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                   '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                   '16:00', '16:30', '17:00', '17:30'],
          saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
          sunday: [] // Fechado
        }
        
        if (dayOfWeek === 0) return workingHours.sunday
        if (dayOfWeek === 6) return workingHours.saturday
        return workingHours.weekday
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar horários disponíveis'
      setError(errorMessage)
      return []
    }
  }

  return {
    availableHours,
    loading,
    error,
    fetchBarberAvailableHours,
    createAvailableHour,
    updateAvailableHour,
    deleteAvailableHour,
    getScheduleByDay,
    getAvailableSlotsForDate
  }
}