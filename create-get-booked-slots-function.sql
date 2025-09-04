-- Função RPC para obter horários ocupados sem restrições RLS
-- Esta função pode ser chamada por qualquer usuário autenticado

CREATE OR REPLACE FUNCTION get_booked_slots(p_barber_id UUID, p_date DATE)
RETURNS TABLE(hora TIME) AS $$
BEGIN
  RETURN QUERY
  SELECT a.hora
  FROM appointments a
  WHERE a.barber_id = p_barber_id
    AND a.data = p_date
    AND a.status = 'agendado';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION get_booked_slots(UUID, DATE) TO authenticated;