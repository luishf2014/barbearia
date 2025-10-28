'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { useAuth } from './useAuth'

type AvailableHour = Database['public']['Tables']['available_hours']['Row']
type AvailableHourInsert = Database['public']['Tables']['available_hours']['Insert']
type AvailableHourUpdate = Database['public']['Tables']['available_hours']['Update']

// Cache global para horÃ¡rios disponÃ­veis
const availableHoursCache = new Map<string, { data: AvailableHour[]; timestamp: number }>()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutos
const MAX_RETRIES = 3
const INITIAL_BACKOFF = 500
const MAX_BACKOFF = 5000

// FunÃ§Ã£o de retry com backoff exponencial
// CHATGPT: Tipagem segura de erro como `unknown` com extração defensiva
const retryWithBackoff = async <T>(fn: () => Promise<T>): Promise<T> => {
  let retries = 0
  let backoff = INITIAL_BACKOFF
  
  while (retries <= MAX_RETRIES) {
    try {
      return await fn()
    } catch (err: unknown) {
      if (retries === MAX_RETRIES) throw err

      const maybeObj = typeof err === 'object' && err ? (err as Record<string, unknown>) : null
      const message = typeof maybeObj?.message === 'string' ? maybeObj.message : undefined
      const code = typeof maybeObj?.code === 'string' ? maybeObj.code : undefined

      if ((message && message.includes('rate limit')) || code === 'PGRST301') {
        console.log(`Rate limit reached. Retrying in ${backoff}ms (${retries + 1}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        backoff = Math.min(backoff * 2, MAX_BACKOFF)
        retries++
      } else {
        throw err
      }
    }
  }
  
  throw new Error('Max retries exceeded')
}

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

  // FunÃ§Ã£o para invalidar cache
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      availableHoursCache.delete(key)
    } else {
      availableHoursCache.clear()
    }
  }, [])

  // Buscar horÃ¡rios disponÃ­veis para um barbeiro com cache
  const fetchBarberAvailableHours = async (barberId: string, forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const cacheKey = `barber_hours_${barberId}`
      const now = Date.now()
      
      // Verificar cache
      if (!forceRefresh) {
        const cached = availableHoursCache.get(cacheKey)
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          setAvailableHours(cached.data || [])
          setLoading(false)
          return cached.data
        }
      }

      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/available-hours?barber_id=${barberId}`)
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const json = await response.json()
        return (json ?? []) as AvailableHour[]
      })

      // Atualizar cache
      availableHoursCache.set(cacheKey, { data: data || [], timestamp: now })
      
      setAvailableHours(data || [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar horÃ¡rios disponÃ­veis'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Criar um novo horÃ¡rio disponÃ­vel com retry
  const createAvailableHour = async (hourData: AvailableHourInsert) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horÃ¡rios')
      }

      setLoading(true)
      setError(null)

      const data = await retryWithBackoff(async () => {
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

        const json = await response.json()
        return (json ?? []) as AvailableHour[]
      })

      // Invalidar cache relacionado
      if (hourData.barber_id) {
        invalidateCache(`barber_hours_${hourData.barber_id}`)
      }

      // Atualizar lista local
      setAvailableHours(prev => [...prev, ...data])

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar horÃ¡rio disponÃ­vel'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Atualizar um horÃ¡rio disponÃ­vel com retry
  const updateAvailableHour = async (hourId: string, updates: AvailableHourUpdate) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horÃ¡rios')
      }

      setLoading(true)
      setError(null)

      const data = await retryWithBackoff(async () => {
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

        const json = await response.json()
        return json as AvailableHour
      })

      // Invalidar cache relacionado
      if (updates.barber_id) {
        invalidateCache(`barber_hours_${updates.barber_id}`)
      }

      // Atualizar lista local
      setAvailableHours(prev => prev.map(hour => (hour.id === hourId ? data : hour)))

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar horÃ¡rio disponÃ­vel'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Excluir um horÃ¡rio disponÃ­vel
  const deleteAvailableHour = async (hourId: string) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horÃ¡rios')
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
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir horÃ¡rio disponÃ­vel'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Organizar horÃ¡rios por dia da semana
  const getScheduleByDay = (hours: AvailableHour[]): DaySchedule[] => {
    const dayNames = ['Domingo', 'Segunda', 'TerÃ§a', 'Quarta', 'Quinta', 'Sexta', 'SÃ¡bado']
    
    // Inicializar array com os 7 dias da semana
    const scheduleByDay: DaySchedule[] = dayNames.map((name, index) => ({
      dayOfWeek: index,
      dayName: name,
      slots: []
    }))

    // Agrupar horÃ¡rios por dia da semana
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

  // Obter horÃ¡rios disponÃ­veis para uma data especÃ­fica
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
        
        // Se nÃ£o houver dados ou ocorrer erro, buscar da API
        const response = await fetch(`/api/available-hours/slots?date=${date}&barber_id=${barberId}`)
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const apiData = await response.json()
        return apiData || []
      } catch (err) {
        console.error('Erro ao buscar horÃ¡rios via RPC:', err)
        
        // Fallback para horÃ¡rios padrÃ£o
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
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar horÃ¡rios disponÃ­veis'
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
    invalidateCache,
    getScheduleByDay,
    getAvailableSlotsForDate
  }
}
