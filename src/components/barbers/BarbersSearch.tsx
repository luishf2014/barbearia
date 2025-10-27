'use client';

import { memo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface BarbersSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onDebouncedSearch?: (term: string) => void;
}

const BarbersSearch = memo(function BarbersSearch({ searchTerm, setSearchTerm, onDebouncedSearch }: BarbersSearchProps) {
  // Debounce do termo de busca para evitar muitas re-renderizações
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Executa callback quando o termo debounced muda
  useEffect(() => {
    if (onDebouncedSearch) {
      onDebouncedSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onDebouncedSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);
  return (
    <Card className="mb-6 bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white">Filtrar Barbeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
          <Input
            placeholder="Buscar por nome"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-white/50 focus:border-slate-500"
          />
        </div>
      </CardContent>
    </Card>
  );
});

export default BarbersSearch;