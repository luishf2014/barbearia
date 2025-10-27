'use client';

import { useState, useCallback, useRef } from 'react';

// Interface para itens do cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
}

// Interface para configuração do cache
interface CacheConfig {
  defaultTTL?: number; // TTL padrão em milliseconds
  maxSize?: number; // Tamanho máximo do cache
}

// Cache global singleton
class GlobalCache {
  private cache = new Map<string, CacheItem<any>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutos padrão
      maxSize: config.maxSize || 100 // 100 itens máximo
    };
  }

  // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se o item expirou
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Definir item no cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Limpar cache se atingir o tamanho máximo
    if (this.cache.size >= this.config.maxSize) {
      this.clearExpired();
      
      // Se ainda estiver cheio, remover o item mais antigo
      if (this.cache.size >= this.config.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    this.cache.set(key, item);
  }

  // Remover item do cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpar itens expirados
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL
    };
  }

  // Verificar se uma chave existe e não expirou
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Instância global do cache
const globalCache = new GlobalCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 200 // 200 itens
});

// Hook para usar o cache global
export function useGlobalCache() {
  const [, forceUpdate] = useState({});
  const forceUpdateRef = useRef(() => forceUpdate({}));

  const get = useCallback(<T>(key: string): T | null => {
    return globalCache.get<T>(key);
  }, []);

  const set = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    globalCache.set(key, data, ttl);
    forceUpdateRef.current();
  }, []);

  const remove = useCallback((key: string): boolean => {
    const result = globalCache.delete(key);
    forceUpdateRef.current();
    return result;
  }, []);

  const clear = useCallback((): void => {
    globalCache.clear();
    forceUpdateRef.current();
  }, []);

  const has = useCallback((key: string): boolean => {
    return globalCache.has(key);
  }, []);

  const getStats = useCallback(() => {
    return globalCache.getStats();
  }, []);

  const clearExpired = useCallback((): void => {
    globalCache.clearExpired();
    forceUpdateRef.current();
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    has,
    getStats,
    clearExpired
  };
}

// Hook para cache com fetch automático
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { get, set, has } = useGlobalCache();
  const [data, setData] = useState<T | null>(() => get<T>(key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (options.enabled === false) return;
    
    // Se já tem dados no cache e não é refresh forçado, usar cache
    if (!forceRefresh && has(key)) {
      const cachedData = get<T>(key);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      // Salvar no cache
      set(key, result, options.ttl);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, options, get, set, has]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
  }, [key]);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh,
    invalidate
  };
}

export default globalCache;