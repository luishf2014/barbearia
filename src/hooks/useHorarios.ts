'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

type Horario = {
  id: string
  barber_id: string
  hora: string
  created_at?: string
}

type HorarioInsert = Omit<Horario, 'id' | 'created_at'>

export function useHorarios() {
  const { isAdmin } = useAuth()
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar horários
  const fetchHorarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('available_hours')
        .select('*')
        .order('hora', { ascending: true })

      if (error) throw error

      setHorarios(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar horários')
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar horário
  const createHorario = async (horarioData: HorarioInsert) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horários')
      }

      setError(null)

      const { data, error } = await supabase
        .from('available_hours')
        .insert([horarioData])
        .select()
        .single()

      if (error) throw error

      setHorarios(prev => [...prev, data])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar horário'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Excluir horário
  const deleteHorario = async (horarioId: string) => {
    try {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem gerenciar horários')
      }

      setError(null)

      const { error } = await supabase
        .from('available_hours')
        .delete()
        .eq('id', horarioId)

      if (error) throw error

      setHorarios(prev => prev.filter(horario => horario.id !== horarioId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir horário'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Carregar horários ao inicializar
  useEffect(() => {
    fetchHorarios()
  }, [fetchHorarios])

  return {
    horarios,
    loading,
    error,
    fetchHorarios,
    createHorario,
    deleteHorario
  }
}