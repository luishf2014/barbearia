'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { Clock } from 'lucide-react';
import { Toaster } from 'sonner';

// Lazy loaded components
const AddScheduleForm = lazy(() => import('@/components/schedules/AddScheduleForm'));
const SchedulesList = lazy(() => import('@/components/schedules/SchedulesList'));


// Loading component
function LoadingCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded mb-4 w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        <div className="h-10 bg-slate-700 rounded w-full"></div>
      </div>
    </div>
  );
}

const DAYS_OF_WEEK = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

interface CustomSchedule {
  id?: string;
  day: string;
  time: string;
  barber_id?: string;
  active: boolean;
}

export default function HorariosPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Configuração de Horários</h1>
        </div>
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }



  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Configuração de Horários</h1>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <AddScheduleForm />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <SchedulesList />
      </Suspense>

      <Toaster />
    </div>
  );
}