'use client'

import { useState, useEffect, useCallback } from 'react' // CHATGPT: alterei aqui (removi React não utilizado)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
type Client = {
  id: string
  nome: string
  email: string
  telefone?: string
  tipo: string
  created_at: string
  updated_at: string
}

export function useClients() {
  console.log('ðŸŽ¯ useClients hook inicializado')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  console.log('ðŸ”— Cliente Supabase criado:', !!supabase)
  console.log('ðŸŒ Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('ðŸ”‘ Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  console.log('ðŸ“ Antes do useEffect - hook inicializado')
  console.log('ðŸ“ useEffect estÃ¡ definido?', typeof useEffect)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('ðŸ” Buscando clientes...')
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tipo', 'cliente')
        .order('nome', { ascending: true })
      
      if (error) {
        console.error('âŒ Erro ao buscar clientes:', error)
        throw error
      }
      
      console.log('âœ… Clientes encontrados:', data?.length || 0)
      setClients(data || [])
    } catch (err) {
      console.error('âŒ Erro no fetchClients:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const refreshClients = () => {
    fetchClients()
  }

  useEffect(() => {
    console.log('ðŸš€ useEffect executado - buscando clientes')
    console.log('ðŸ”„ useEffect: Iniciando fetchClients')
    fetchClients()
    console.log('ðŸ”„ useEffect: fetchClients chamado')
  }, [fetchClients])
  
  console.log('ðŸ“ Depois do useEffect - retornando dados')

  return {
    clients,
    loading,
    error,
    refreshClients,
    fetchClients
  }
}

export type { Client }
