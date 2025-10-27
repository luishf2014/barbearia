'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Barber = Database['public']['Tables']['barbers']['Row']
type BarberInsert = Database['public']['Tables']['barbers']['Insert']
type BarberUpdate = Database['public']['Tables']['barbers']['Update']

// Cache global para barbeiros
let barbersCache: {
  data: Barber[]
  timestamp: number
  includeInactive: boolean
} | null = null

const CACHE_TTL = 3 * 60 * 1000 // 3 minutos
const MAX_RETRIES = 3
const INITIAL_BACKOFF = 500
const MAX_BACKOFF = 5000

// Função de retry com backoff exponencial
const retryWithBackoff = async <T>(fn: () => Promise<T>): Promise<T> => {
  let retries = 0
  let backoff = INITIAL_BACKOFF
  
  while (retries <= MAX_RETRIES) {
    try {
      return await fn()
    } catch (error: any) {
      if (retries === MAX_RETRIES) throw error
      
      // Verificar se é erro de rate limit
      if (error?.message?.includes('rate limit') || error?.code === 'PGRST301') {
        console.log(`Rate limit reached. Retrying in ${backoff}ms (${retries + 1}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        backoff = Math.min(backoff * 2, MAX_BACKOFF)
        retries++
      } else {
        throw error
      }
    }
  }
  
  throw new Error('Max retries exceeded')
}

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar barbeiros com cache e retry
  const fetchBarbers = useCallback(async (includeInactive = false, forceRefresh = false) => {
    try {
      console.log('👨‍💼 Buscando barbeiros...', { includeInactive, forceRefresh })
      setLoading(true)
      setError(null)
      
      const now = Date.now()
      
      // Verificar cache
      if (!forceRefresh && barbersCache && 
          (now - barbersCache.timestamp) < CACHE_TTL &&
          barbersCache.includeInactive === includeInactive) {
        console.log('📦 Usando cache de barbeiros')
        setBarbers(barbersCache.data)
        setLoading(false)
        return barbersCache.data
      }

      // Buscar dados com retry
      const data = await retryWithBackoff(async () => {
        let query = supabase
          .from('barbers')
          .select('*')
          .order('nome', { ascending: true })

        if (!includeInactive) {
          query = query.eq('status', 'ativo')
        }

        const { data, error } = await query
        console.log('📊 Resultado busca barbeiros:', { data, error })

        if (error) throw error
        return data || []
      })

      // Atualizar cache
      barbersCache = {
        data,
        timestamp: now,
        includeInactive
      }

      setBarbers(data)
      console.log('✅ Barbeiros carregados:', data)
      return data
    } catch (err) {
      console.error('❌ Erro ao buscar barbeiros:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar barbeiros')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    barbersCache = null
  }, [])

  // Criar barbeiro com invalidação de cache
  const createBarber = async (barberData: Omit<BarberInsert, 'id' | 'created_at'>) => {
    try {
      // Garantir que o status seja 'ativo' por padrão
      const dataWithDefaults = {
        ...barberData,
        status: barberData.status || 'ativo' as const
      }
      
      console.log('➕ Criando barbeiro:', dataWithDefaults)
      setError(null)

      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('barbers')
          .insert(dataWithDefaults)
          .select()
          .single()

        console.log('📊 Resultado criação barbeiro:', { data, error })

        if (error) throw error
        return data
      })

      // Invalidar cache e atualizar lista local
      invalidateCache()
      setBarbers(prev => [...prev, data])
      console.log('✅ Barbeiro criado:', data)
      
      return { data, error: null }
    } catch (err) {
      console.error('❌ Erro ao criar barbeiro:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar barbeiro'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Atualizar barbeiro com retry e invalidação de cache
  const updateBarber = async (id: string, updates: BarberUpdate) => {
    try {
      console.log('✏️ Atualizando barbeiro:', { id, updates })
      setError(null)

      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('barbers')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        console.log('📊 Resultado atualização barbeiro:', { data, error })

        if (error) throw error
        return data
      })

      // Invalidar cache e atualizar lista local
      invalidateCache()
      setBarbers(prev => prev.map(barber => 
        barber.id === id ? data : barber
      ))
      console.log('✅ Barbeiro atualizado:', data)
      
      return { data, error: null }
    } catch (err) {
      console.error('❌ Erro ao atualizar barbeiro:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar barbeiro'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Deletar barbeiro (na verdade, inativar)
  const deleteBarber = async (id: string) => {
    return updateBarber(id, { status: 'inativo' })
  }

  // Ativar barbeiro
  const activateBarber = async (id: string) => {
    return updateBarber(id, { status: 'ativo' })
  }

  // Buscar barbeiro por ID com retry
  const getBarberById = async (id: string) => {
    try {
      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        return data
      })

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar barbeiro'
      return { data: null, error: errorMessage }
    }
  }

  // Configurar realtime
  useEffect(() => {
    console.log('🔄 useBarbers useEffect executado')
    // Buscar apenas barbeiros ativos por padrão
    fetchBarbers(false)

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('barbers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barbers'
        },
        () => {
          // Manter o mesmo filtro do cache atual
          const includeInactive = barbersCache?.includeInactive || false
          fetchBarbers(includeInactive)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBarbers])

  return {
    barbers,
    loading,
    error,
    createBarber,
    updateBarber,
    deleteBarber,
    activateBarber,
    getBarberById,
    invalidateCache,
    refetch: fetchBarbers
  }
}