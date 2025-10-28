import { useState, useEffect } from 'react';
import type { DependencyList } from 'react'; // CHATGPT: alterei aqui (import de tipo para deps)

/**
 * Hook personalizado para implementar debounce em valores
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook personalizado para implementar debounce em callbacks
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @param deps - Dependências do callback
 * @returns Função debounced
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>( // CHATGPT: alterei aqui (substituí any por unknown)
  callback: T,
  delay: number = 300,
  deps: DependencyList = [] // CHATGPT: alterei aqui (uso de tipo importado)
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
      setDebouncedCallback(null);
    };
  }, [callback, delay, JSON.stringify(deps)]); // CHATGPT: alterei aqui (evitei spread na lista de deps)

  return (debouncedCallback || callback) as T;
}
