'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase'

// Cache global para otimizaÃ§Ã£o
const scheduleCache = new Map<string, { data: unknown; timestamp: number }>() // CHATGPT: alterei aqui (const + unknown no cache)()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

type TimeSlot = {
  time_slot: string
  is_available: boolean
}

type BusinessHour = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  interval_minutes: number
  is_active: boolean
}

type AvailableHour = {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  interval_minutes: number
  is_active: boolean
}

export function useSchedule() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClientComponentClient<Database>(), [])

  // FunÃ§Ã£o para invalidar cache
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      scheduleCache.delete(key)
    } else {
      scheduleCache.clear()
    }
  }, [])

  // FunÃ§Ã£o para verificar cache
  const getCachedData = useCallback((key: string) => {
    const cached = scheduleCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }, [])

  // FunÃ§Ã£o para salvar no cache
  const setCachedData = useCallback((key: string, data: unknown) => {
    scheduleCache.set(key, { data, timestamp: Date.now() })
  }, [])

  const getAvailableSlots = useCallback(async (barberId: string, date: string): Promise<TimeSlot[]> => {
    const cacheKey = `slots_${barberId}_${date}`
    
    // Verificar cache primeiro
    const cached = getCachedData(cacheKey) as TimeSlot[] | null
    if (cached) {
      return cached
    }

    try {
      setLoading(true)
      setError(null)
      
      // OtimizaÃ§Ã£o: Tentar RPC primeiro com timeout
      const rpcPromise = supabase
        .rpc('get_barber_availability', {
          p_barber_id: barberId,
          p_date: date
        })

      // Timeout de 3 segundos para RPC
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout')), 3000)
      )

      try {
        const { data: rpcData, error: rpcError } = await Promise.race([
          rpcPromise,
          timeoutPromise
        ]) as { data: unknown; error: unknown } // CHATGPT: alterei aqui (tipo explícito em vez de any)

        if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
          // Recalcular disponibilidade considerando mÃºltiplos status de agendamento
          try {
            const { data: booked } = await supabase
              .from('appointments')
              .select('hora')
              .eq('barber_id', barberId)
              .eq('data', date)
              .in('status', ['agendado', 'confirmado', 'pendente'])

            const bookedTimes = new Set((booked || []).map(a => a.hora))
            const slots = rpcData as Array<{ time_slot: string; is_available: boolean }>
            const result = slots.map((slot) => ({
              time_slot: slot.time_slot,
              is_available: !bookedTimes.has(slot.time_slot)
            })) as TimeSlot[]
            setCachedData(cacheKey, result)
            return result
          } catch (error: unknown) { // CHATGPT: alterei aqui (erro tipado como unknown)
            // Se falhar ao buscar agendamentos, usar resultado do RPC
            const slots = rpcData as Array<{ time_slot: string; is_available: boolean }>
            const result = slots.map((slot) => ({
              time_slot: slot.time_slot,
              is_available: slot.is_available
            })) as TimeSlot[]
            setCachedData(cacheKey, result)
            return result
          }
        }
      } catch (rpcErr: unknown) { // CHATGPT: alterei aqui (erro tipado como unknown)
        console.warn('RPC falhou ou timeout, usando fallback:', rpcErr)
      }

      // Fallback otimizado: usar horÃ¡rios padrÃ£o e verificar agendamentos
      const dayOfWeek = new Date(date).getDay()
      const defaultHours =
        dayOfWeek === 0 ? [] : // Domingo fechado
        dayOfWeek === 6 ? ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30'] : // SÃ¡bado
        ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'] // Segunda a sexta

      // Buscar agendamentos existentes em paralelo
      const appointmentsPromise = supabase
        .from('appointments')
        .select('hora')
        .eq('barber_id', barberId)
        .eq('data', date)
        .in('status', ['agendado', 'confirmado', 'pendente'])

      try {
        const { data: appointments } = await appointmentsPromise
        const bookedTimes = new Set(appointments?.map(apt => apt.hora) || [])
        
        const result = defaultHours.map(time => ({
          time_slot: time,
          is_available: !bookedTimes.has(time)
        }))
        
        setCachedData(cacheKey, result)
        return result
      } catch (fallbackErr: unknown) { // CHATGPT: alterei aqui (erro tipado como unknown)
        console.warn('Fallback falhou, usando horÃ¡rios padrÃ£o:', fallbackErr)
        // Em caso de erro, retornar todos os horÃ¡rios como disponÃ­veis
        const result = defaultHours.map(time => ({
          time_slot: time,
          is_available: true
        }))
        setCachedData(cacheKey, result)
        return result
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase, getCachedData, setCachedData])

  const getBusinessHours = useCallback(async (): Promise<BusinessHour[]> => {
    const cacheKey = 'business_hours'
    
    // Verificar cache primeiro
    const cached = getCachedData(cacheKey) as BusinessHour[] | null
    if (cached) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
      
      if (error) throw error
      
      const result = data || []
      setCachedData(cacheKey, result)
      return result
    } catch (err) {
      return []
    }
  }, [supabase, getCachedData, setCachedData])

  const getBarberHours = useCallback(async (barberId: string): Promise<AvailableHour[]> => {
    const cacheKey = `barber_hours_${barberId}`
    
    // Verificar cache primeiro
    const cached = getCachedData(cacheKey) as AvailableHour[] | null
    if (cached) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from('available_hours')
        .select('*')
        .eq('barber_id', barberId)
        .eq('is_active', true)
        .order('day_of_week')
      
      if (error) throw error
      
      const result = data || []
      setCachedData(cacheKey, result)
      return result
    } catch (err) {
      return []
    }
  }, [supabase, getCachedData, setCachedData])

  const updateBusinessHours = useCallback(async (hours: Omit<BusinessHour, 'id'>[]) => {
    try {
      setLoading(true)
      setError(null)
      
      // Desativar todos os horÃ¡rios existentes
      await supabase
        .from('business_hours')
        .update({ is_active: false })
        .eq('is_active', true)
      
      // Inserir novos horÃ¡rios
      const { error } = await supabase
        .from('business_hours')
        .insert(hours)
      
      if (error) throw error
      
      // Invalidar cache relacionado
      invalidateCache('business_hours')
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, invalidateCache])

  const updateBarberHours = useCallback(async (barberId: string, hours: Omit<AvailableHour, 'id' | 'barber_id'>[]) => {
    try {
      setLoading(true)
      setError(null)
      
      // Desativar horÃ¡rios existentes do barbeiro
      await supabase
        .from('available_hours')
        .update({ is_active: false })
        .eq('barber_id', barberId)
        .eq('is_active', true)
      
      // Inserir novos horÃ¡rios
      const hoursWithBarberId = hours.map(hour => ({
        ...hour,
        barber_id: barberId
      }))
      
      const { error } = await supabase
        .from('available_hours')
        .insert(hoursWithBarberId)
      
      if (error) throw error
      
      // Invalidar cache relacionado
      invalidateCache(`barber_hours_${barberId}`)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, invalidateCache])

  return {
    loading,
    error,
    getAvailableSlots,
    getBusinessHours,
    getBarberHours,
    updateBusinessHours,
    updateBarberHours,
    invalidateCache
  }
}

export type { TimeSlot, BusinessHour, AvailableHour }