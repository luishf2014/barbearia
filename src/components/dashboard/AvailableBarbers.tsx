'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, User, Star } from 'lucide-react';
import { Database } from '@/lib/supabase';

type Barber = Database['public']['Tables']['barbers']['Row'];

interface AvailableBarbersProps {
  barbers: Barber[];
  dayName: string;
}

export default function AvailableBarbers({ barbers, dayName }: AvailableBarbersProps) {
  const activeBarbers = barbers?.filter(barber => barber.status === 'ativo') || [];

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-full p-2">
            <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-oswald">BARBEIROS HOJE</h2>
        </div>
        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Profissionais disponíveis para atendimento - {dayName}</p>
        
        {activeBarbers.length === 0 ? (
          <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
            <Scissors className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <p className="font-medium text-lg">Nenhum barbeiro disponível</p>
            <p className="text-sm mt-2">Adicione barbeiros na seção de gerenciamento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {activeBarbers.map((barber) => (
              <div key={barber.id} className="bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-600 hover:bg-slate-700/70 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-900" />
                  </div>
                  
                  <h3 className="font-bold text-white text-lg mb-2">{barber.nome}</h3>
                  
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
                    Disponível
                  </Badge>
                  
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="h-4 w-4 text-yellow-400 fill-current" 
                      />
                    ))}
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    <p className="mb-1">Especialidades:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        Corte Tradicional
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        Barba
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}