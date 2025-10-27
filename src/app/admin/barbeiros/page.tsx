'use client';

import { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBarbers } from '@/hooks/useBarbers';
import { useDebounce } from '@/hooks/useDebounce';
import { Scissors } from 'lucide-react';
import { Toaster } from 'sonner';

// Lazy loading dos componentes
const AddBarberForm = lazy(() => import('@/components/barbers/AddBarberForm'));
const BarbersList = lazy(() => import('@/components/barbers/BarbersList'));
const BarbersSearch = lazy(() => import('@/components/barbers/BarbersSearch'));

// Loading component
const LoadingCard = () => (
  <Card className="bg-slate-800 border-slate-700 animate-pulse">
    <CardContent className="p-6">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
    </CardContent>
  </Card>
);

export default function BarbeirosPage() {
  const { barbers, createBarber, updateBarber, deleteBarber, loading, error, refetch } = useBarbers();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Buscar todos os barbeiros (incluindo inativos) na página de administração
  useEffect(() => {
    refetch(true); // true = incluir inativos
  }, [refetch]);
  
  // Debounce do termo de busca para melhorar performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Callback para o componente BarbersSearch
  const handleDebouncedSearch = useCallback((term: string) => {
    // Aqui poderia implementar lógica adicional se necessário
    console.log('🔍 Busca debounced:', term);
  }, []);
  
  // Memoizar a filtragem para evitar recálculos desnecessários
  const filteredBarbers = useMemo(() => {
    if (!barbers) return [];
    if (!debouncedSearchTerm.trim()) return barbers;
    
    return barbers.filter(barber => 
      barber.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [barbers, debouncedSearchTerm]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular loading inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 px-6">
        <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="bg-white rounded-full p-2">
                <Scissors className="h-6 w-6 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold text-white font-oswald">GERENCIAR BARBEIROS</h1>
            </div>
            <p className="text-xl text-white/80">
              Adicione, edite e gerencie os barbeiros da sua barbearia
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <Scissors className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">GERENCIAR BARBEIROS</h1>
          </div>
          <p className="text-xl text-white/80">
            Adicione, edite e gerencie os barbeiros da sua barbearia
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <AddBarberForm createBarber={createBarber} />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <BarbersSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onDebouncedSearch={handleDebouncedSearch}
        />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <BarbersList 
          barbers={filteredBarbers} 
          searchTerm={debouncedSearchTerm} 
          updateBarber={updateBarber}
          deleteBarber={deleteBarber}
        />
      </Suspense>
    </div>
  );
}