-- SOLUÇÃO DEFINITIVA PARA HORÁRIOS OCUPADOS
-- Execute este código no SQL Editor do Supabase

-- 1. Criar função RPC para buscar horários ocupados (contorna RLS)
CREATE OR REPLACE FUNCTION get_booked_slots(
  barber_id UUID,
  appointment_date DATE
)
RETURNS TABLE(
  hora TEXT,
  barber_id UUID,
  data DATE,
  status TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.hora,
    a.barber_id,
    a.data,
    a.status
  FROM appointments a
  WHERE a.barber_id = get_booked_slots.barber_id
    AND a.data = get_booked_slots.appointment_date
    AND a.status = 'agendado';
END;
$$;

-- 2. Dar permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION get_booked_slots(UUID, DATE) TO authenticated;

-- 3. Política RLS alternativa (caso prefira não usar RPC)
DROP POLICY IF EXISTS "Ver horários ocupados para disponibilidade" ON public.appointments;

CREATE POLICY "Ver horários ocupados para disponibilidade" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    status = 'agendado' OR 
    auth.uid() = user_id
  );

-- INSTRUÇÕES:
-- 1. Execute todo este código no SQL Editor do Supabase
-- 2. Teste a página de agendamento
-- 3. Os horários ocupados devem aparecer corretamente

-- TESTE DA FUNÇÃO (opcional):
-- SELECT * FROM get_booked_slots('seu-barber-id-aqui'::UUID, '2024-09-04'::DATE);