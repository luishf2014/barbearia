-- Criar tabela de horários disponíveis
CREATE TABLE IF NOT EXISTS public.available_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 (domingo) a 6 (sábado)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  interval_minutes INTEGER NOT NULL DEFAULT 30, -- intervalo entre horários em minutos
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_barber_day_time UNIQUE (barber_id, day_of_week, start_time, end_time)
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.available_hours ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso de leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" 
  ON public.available_hours 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Criar política para permitir inserção/atualização/exclusão apenas para administradores
CREATE POLICY "Permitir gerenciamento apenas para administradores" 
  ON public.available_hours 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.tipo = 'admin'
  ));

-- Criar função para gerar horários disponíveis com base nas configurações
CREATE OR REPLACE FUNCTION public.get_available_slots(p_barber_id UUID, p_date DATE)
RETURNS TABLE (time_slot TIME) AS $$
DECLARE
  day_num INTEGER;
  slot_record RECORD;
  current_time TIME;
BEGIN
  -- Obter o dia da semana (0-6, domingo-sábado)
  day_num := EXTRACT(DOW FROM p_date);
  
  -- Para cada configuração de horário do barbeiro para este dia da semana
  FOR slot_record IN 
    SELECT * FROM public.available_hours 
    WHERE barber_id = p_barber_id 
    AND day_of_week = day_num 
    AND is_active = true
  LOOP
    -- Gerar slots de horário com base no intervalo
    current_time := slot_record.start_time;
    
    WHILE current_time < slot_record.end_time LOOP
      -- Retornar o horário disponível
      time_slot := current_time;
      RETURN NEXT;
      
      -- Avançar para o próximo slot
      current_time := current_time + (slot_record.interval_minutes || ' minutes')::interval;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Criar função para verificar disponibilidade de horários
CREATE OR REPLACE FUNCTION public.get_barber_availability(p_barber_id UUID, p_date DATE)
RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  booked_slots TIME[];
BEGIN
  -- Obter horários já agendados
  SELECT array_agg(hora::TIME) INTO booked_slots 
  FROM public.appointments 
  WHERE barber_id = p_barber_id 
  AND data = p_date 
  AND status = 'agendado';
  
  -- Se não houver agendamentos, definir como array vazio
  IF booked_slots IS NULL THEN
    booked_slots := '{}'::TIME[];
  END IF;
  
  -- Retornar todos os horários disponíveis com status
  RETURN QUERY 
  SELECT 
    avail.time_slot,
    NOT (avail.time_slot = ANY(booked_slots)) AS is_available
  FROM 
    public.get_available_slots(p_barber_id, p_date) avail
  ORDER BY 
    avail.time_slot;
    
  RETURN;
END;
$$ LANGUAGE plpgsql;