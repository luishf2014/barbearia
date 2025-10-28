'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import { DynamicOptionsLoadingProps } from 'next/dynamic';

// Loading component genérico
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );
};

const LoadingCard = () => {
  return (
    <div className="bg-slate-800 border-slate-700 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
    </div>
  );
};

// Função helper para criar componentes dinâmicos com loading
function createDynamicComponent<T = unknown>( // CHATGPT: alterei aqui (substituí {} por unknown)
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent?: (props: DynamicOptionsLoadingProps) => ReactNode
): ComponentType<T> { // CHATGPT: alterei aqui (tipagem explícita do retorno)
  return dynamic(importFn, {
    loading: loadingComponent || LoadingSpinner,
    ssr: false // Desabilitar SSR para componentes pesados
  }) as ComponentType<T>; // CHATGPT: alterei aqui (assegurei o tipo do componente dinâmico)
}

// Componentes de barbeiros (existem no projeto)
export const DynamicAddBarberForm = createDynamicComponent(
  () => import('@/components/barbers/AddBarberForm'),
  () => <LoadingCard />
);

export const DynamicBarbersList = createDynamicComponent(
  () => import('@/components/barbers/BarbersList'),
  () => <LoadingCard />
);

export const DynamicBarbersSearch = createDynamicComponent(
  () => import('@/components/barbers/BarbersSearch'),
  () => <LoadingCard />
);

// Componentes de dashboard (existem no projeto)
export const DynamicStatsCards = createDynamicComponent(
  () => import('@/components/dashboard/StatsCards'),
  () => <LoadingCard />
);

export const DynamicRecentAppointments = createDynamicComponent(
  () => import('@/components/dashboard/RecentAppointments'),
  () => <LoadingCard />
);

export const DynamicBarberPerformance = createDynamicComponent(
  () => import('@/components/dashboard/BarberPerformance'),
  () => <LoadingCard />
);

export const DynamicAvailableBarbers = createDynamicComponent(
  () => import('@/components/dashboard/AvailableBarbers'),
  () => <LoadingCard />
);

// Componentes de horários (existem no projeto)
export const DynamicSchedulesList = createDynamicComponent(
  () => import('@/components/schedules/SchedulesList'),
  () => <LoadingCard />
);

export const DynamicAddScheduleForm = createDynamicComponent(
  () => import('@/components/schedules/AddScheduleForm'),
  () => <LoadingCard />
);

// Função para pré-carregar componentes críticos
export function preloadCriticalComponents() {
  // Pré-carregar componentes que existem e são críticos
  const criticalImports = [
    () => import('@/components/barbers/BarbersList'),
    () => import('@/components/dashboard/StatsCards'),
    () => import('@/components/dashboard/RecentAppointments')
  ];

  criticalImports.forEach(importFn => {
    // Executar import mas não aguardar
    importFn().catch((error: unknown) => { // CHATGPT: alterei aqui (tipagem explícita e segura)
      console.warn('Falha ao pré-carregar componente:', error);
    });
  });
}

// Função para carregar componentes baseado na rota
export function preloadRouteComponents(route: string) {
  const routeComponentMap: Record<string, Array<() => Promise<unknown>>> = { // CHATGPT: alterei aqui (substituí any por unknown)
    '/admin/barbeiros': [
      () => import('@/components/barbers/AddBarberForm'),
      () => import('@/components/barbers/BarbersList'),
      () => import('@/components/barbers/BarbersSearch')
    ],
    '/admin/horarios': [
      () => import('@/components/schedules/SchedulesList'),
      () => import('@/components/schedules/AddScheduleForm')
    ],
    '/admin/dashboard': [
      () => import('@/components/dashboard/StatsCards'),
      () => import('@/components/dashboard/RecentAppointments'),
      () => import('@/components/dashboard/BarberPerformance'),
      () => import('@/components/dashboard/AvailableBarbers')
    ]
  };

  const componentsToLoad = routeComponentMap[route];
  if (componentsToLoad) {
    componentsToLoad.forEach(importFn => {
      importFn().catch((error: unknown) => { // CHATGPT: alterei aqui (tipagem explícita e segura)
        console.warn(`Falha ao pré-carregar componente para rota ${route}:`, error);
      });
    });
  }
}

// Hook para pré-carregamento inteligente
export function useIntelligentPreloading() {
  const preloadOnHover = (route: string) => {
    return {
      onMouseEnter: () => {
        preloadRouteComponents(route);
      }
    };
  };

  const preloadOnFocus = (route: string) => {
    return {
      onFocus: () => {
        preloadRouteComponents(route);
      }
    };
  };

  return {
    preloadOnHover,
    preloadOnFocus,
    preloadRouteComponents
  };
}
