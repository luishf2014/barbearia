'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Barber = Database['public']['Tables']['barbers']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

export function useSimpleData() {
  console.log('🚀 useSimpleData hook inicializado')
  
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('📊 Estado atual:', { barbers: barbers.length, services: services.length, loading, error })

  // Teste simples primeiro
  useEffect(() => {
    console.log('🔄 useSimpleData useEffect EXECUTADO!')
    console.log('⏰ Timestamp:', new Date().toISOString())
    
    // Teste básico sem async
    setTimeout(() => {
      console.log('⏱️ Timeout executado após 1 segundo')
      setLoading(false)
    }, 1000)
    
    // Função async separada
    const fetchData = async () => {
      console.log('📡 Iniciando busca de dados simples...')
      
      try {
        // Teste de conexão básica
        console.log('🔗 Testando conexão com Supabase...')
        const { data: testData, error: testError } = await supabase
          .from('barbers')
          .select('count')
          .limit(1)
          
        console.log('🧪 Teste de conexão:', { testData, testError })
        
        if (testError) {
          console.error('❌ Erro na conexão:', testError)
          setError('Erro de conexão: ' + testError.message)
          return
        }

        // Buscar barbeiros
        console.log('👨‍💼 Buscando barbeiros...')
        const { data: barbersData, error: barbersError } = await supabase
          .from('barbers')
          .select('*')
          .eq('status', 'ativo')
          .order('nome', { ascending: true })

        console.log('📊 Resultado barbeiros:', { data: barbersData, error: barbersError })

        if (barbersError) {
          console.error('❌ Erro ao buscar barbeiros:', barbersError)
          setError('Erro barbeiros: ' + barbersError.message)
          return
        }

        setBarbers(barbersData || [])
        console.log('✅ Barbeiros definidos:', barbersData?.length || 0)

        // Buscar serviços
        console.log('🛠️ Buscando serviços...')
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('ativo', true)
          .order('nome', { ascending: true })

        console.log('📊 Resultado serviços:', { data: servicesData, error: servicesError })

        if (servicesError) {
          console.error('❌ Erro ao buscar serviços:', servicesError)
          setError('Erro serviços: ' + servicesError.message)
          return
        }

        setServices(servicesData || [])
        console.log('✅ Serviços definidos:', servicesData?.length || 0)

      } catch (err) {
        console.error('💥 Erro geral na busca:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        console.log('🏁 Busca finalizada')
      }
    }

    // Executar busca
    fetchData()
  }, [])

  console.log('🔚 useSimpleData retornando:', { barbers: barbers.length, services: services.length, loading, error })

  return {
    barbers,
    services,
    loading,
    error
  };
}