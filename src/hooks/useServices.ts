'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { useCachedData } from '@/hooks/useGlobalCache';

type Service = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

// Constantes para retry e backoff
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 500;
const MAX_BACKOFF = 5000;

// Função de retry com backoff exponencial
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('rate limit')) {
      const delay = Math.min(
        INITIAL_BACKOFF * Math.pow(2, MAX_RETRIES - retries),
        MAX_BACKOFF
      );
      
      console.log(`⏳ Rate limit atingido, tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Função para buscar serviços
const fetchServices = async (includeInactive = false): Promise<Service[]> => {
  return retryWithBackoff(async () => {
    console.log('🔍 Buscando serviços no Supabase, includeInactive:', includeInactive);
    
    let query = supabase
      .from('services')
      .select('*')
      .order('nome', { ascending: true });

    if (!includeInactive) {
      query = query.eq('ativo', true);
    }

    const { data, error } = await query;
    console.log('📊 Resultado busca serviços:', { data, error, count: data?.length });

    if (error) {
      console.error('❌ Erro na query de serviços:', error);
      throw error;
    }

    return data || [];
  });
};

export function useServices(includeInactive = false) {
  const cacheKey = `services_${includeInactive ? 'all' : 'active'}`;
  
  const {
    data: services,
    loading,
    error,
    fetchData,
    refresh,
    invalidate
  } = useCachedData(
    cacheKey,
    () => fetchServices(includeInactive),
    {
      ttl: 10 * 60 * 1000, // 10 minutos - serviços mudam pouco
      enabled: true,
      onSuccess: (data) => {
        console.log('🎯 Serviços carregados com sucesso:', data.length);
      },
      onError: (error) => {
        console.error('❌ Erro ao carregar serviços:', error);
      }
    }
  );

  // Carregar dados automaticamente
  useEffect(() => {
    console.log('🔄 useServices useEffect executado, includeInactive:', includeInactive);
    fetchData();
  }, [fetchData]);

  // Criar serviço
  const createService = useCallback(async (serviceData: ServiceInsert): Promise<Service> => {
    try {
      console.log('➕ Criando serviço:', serviceData);
      
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      console.log('✅ Serviço criado:', result);
      
      // Invalidar cache para forçar reload
      invalidate();
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      throw error;
    }
  }, [invalidate]);

  // Atualizar serviço
  const updateService = useCallback(async (id: string, updates: ServiceUpdate): Promise<Service> => {
    try {
      console.log('📝 Atualizando serviço:', { id, updates });
      
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('services')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      console.log('✅ Serviço atualizado:', result);
      
      // Invalidar cache para forçar reload
      invalidate();
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
      throw error;
    }
  }, [invalidate]);

  // Deletar serviço (soft delete)
  const deleteService = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deletando serviço:', id);
      
      await retryWithBackoff(async () => {
        const { error } = await supabase
          .from('services')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
      });

      console.log('✅ Serviço deletado (soft delete)');
      
      // Invalidar cache para forçar reload
      invalidate();
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error);
      throw error;
    }
  }, [invalidate]);

  // Reativar serviço
  const reactivateService = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('🔄 Reativando serviço:', id);
      
      await retryWithBackoff(async () => {
        const { error } = await supabase
          .from('services')
          .update({ ativo: true })
          .eq('id', id);

        if (error) throw error;
      });

      console.log('✅ Serviço reativado');
      
      // Invalidar cache para forçar reload
      invalidate();
    } catch (error) {
      console.error('❌ Erro ao reativar serviço:', error);
      throw error;
    }
  }, [invalidate]);

  // Invalidar cache manualmente
  const invalidateCache = useCallback(() => {
    invalidate();
  }, [invalidate]);

  // Refresh manual
  const refreshServices = useCallback(() => {
    return refresh();
  }, [refresh]);

  return {
    services: services || [],
    loading,
    error,
    createService,
    updateService,
    deleteService,
    reactivateService,
    refreshServices,
    invalidateCache
  };
}