'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

interface DefaultScheduleViewProps {
  className?: string;
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

// Horários pré-definidos de 1 em 1 hora
const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function DefaultScheduleView({ className }: DefaultScheduleViewProps) {
  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-blue-500" />
          Horários Padrão de Funcionamento
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Visualização dos horários disponíveis para agendamento (de 1 em 1 hora)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="space-y-2">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              {day.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TIME_SLOTS.map((time) => (
                <Badge
                  key={`${day.value}-${time}`}
                  variant="secondary"
                  className="bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-slate-300">
              <p className="font-medium mb-1">Informações importantes:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Horários disponíveis: 08:00 às 18:00</li>
                <li>• Intervalo: 1 hora entre cada agendamento</li>
                <li>• Horários podem variar conforme disponibilidade do barbeiro</li>
                <li>• Use o formulário acima para adicionar horários personalizados</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}