-- ========================================
-- EXECUTE ESTE CÓDIGO NO SUPABASE AGORA!
-- ========================================
-- Copie e cole todo este código no SQL Editor do Supabase
-- Isso resolverá o problema dos horários ocupados

-- 1. Criar função RPC para buscar horários ocupados (contorna RLS)
CREATE OR REPLACE FUNCTION get_booked_slots(
  p_barber_id UUID,
  p_appointment_date DATE
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
  WHERE a.barber_id = p_barber_id
    AND a.data = p_appointment_date
    AND a.status = 'agendado';
END;
$$;

-- 2. Dar permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION get_booked_slots(p_barber_id UUID, p_appointment_date DATE) TO authenticated;

-- 3. Política RLS alternativa (caso prefira não usar RPC)
DROP POLICY IF EXISTS "Ver horários ocupados para disponibilidade" ON public.appointments;

CREATE POLICY "Ver horários ocupados para disponibilidade" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    status = 'agendado' OR 
    auth.uid() = cliente_id
  );

-- ========================================
-- APÓS EXECUTAR:
-- 1. Volte para http://localhost:3000/agenda
-- 2. Os horários ocupados aparecerão com 50% opacidade
-- 3. O texto "OCUPADO" será exibido
-- ========================================