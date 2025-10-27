'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  console.log('🎯 useClients hook inicializado')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  console.log('🔗 Cliente Supabase criado:', !!supabase)
  console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  console.log('📍 Antes do useEffect - hook inicializado')
  console.log('📍 useEffect está definido?', typeof useEffect)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Buscando clientes...')
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tipo', 'cliente')
        .order('nome', { ascending: true })
      
      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        throw error
      }
      
      console.log('✅ Clientes encontrados:', data?.length || 0)
      setClients(data || [])
    } catch (err) {
      console.error('❌ Erro no fetchClients:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const refreshClients = () => {
    fetchClients()
  }

  useEffect(() => {
    console.log('🚀 useEffect executado - buscando clientes')
    console.log('🔄 useEffect: Iniciando fetchClients')
    fetchClients()
    console.log('🔄 useEffect: fetchClients chamado')
  }, [fetchClients])
  
  console.log('📍 Depois do useEffect - retornando dados')

  return {
    clients,
    loading,
    error,
    refreshClients,
    fetchClients
  }
}

export type { Client }