import { useState, useEffect } from 'react';

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
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList = []
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
  }, [callback, delay, ...deps]);

  return (debouncedCallback || callback) as T;
}