'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Barber = Database['public']['Tables']['barbers']['Row']
type BarberInsert = Database['public']['Tables']['barbers']['Insert']
type BarberUpdate = Database['public']['Tables']['barbers']['Update']

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar barbeiros
  const fetchBarbers = async (includeInactive = false) => {
    try {
      console.log('👨‍💼 Buscando barbeiros...', { includeInactive })
      setLoading(true)
      setError(null)

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

      setBarbers(data || [])
      console.log('✅ Barbeiros carregados:', data)
    } catch (err) {
      console.error('❌ Erro ao buscar barbeiros:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar barbeiros')
    } finally {
      setLoading(false)
    }
  }

  // Criar barbeiro
  const createBarber = async (barberData: Omit<BarberInsert, 'id' | 'created_at'>) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('barbers')
        .insert(barberData)
        .select()
        .single()

      if (error) throw error

      // Atualizar lista local
      setBarbers(prev => [...prev, data])
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar barbeiro'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Atualizar barbeiro
  const updateBarber = async (id: string, updates: BarberUpdate) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Atualizar lista local
      setBarbers(prev => 
        prev.map(barber => barber.id === id ? data : barber)
      )
      
      return { data, error: null }
    } catch (err) {
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

  // Buscar barbeiro por ID
  const getBarberById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar barbeiro'
      return { data: null, error: errorMessage }
    }
  }

  // Configurar realtime
  useEffect(() => {
    fetchBarbers()

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
          fetchBarbers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    barbers,
    loading,
    error,
    createBarber,
    updateBarber,
    deleteBarber,
    activateBarber,
    getBarberById,
    refetch: fetchBarbers
  }
}