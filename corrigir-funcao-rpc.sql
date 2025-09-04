-- Corrigir a função get_booked_slots para retornar o tipo correto
-- Execute este código no SQL Editor do Supabase

-- 1. Remover a função existente
DROP FUNCTION IF EXISTS get_booked_slots(uuid, date);

-- 2. Criar a função corrigida que retorna TEXT ao invés de TIME
CREATE OR REPLACE FUNCTION get_booked_slots(
  p_barber_id UUID,
  p_appointment_date DATE
)
RETURNS TABLE(hora TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.hora::TEXT as hora
  FROM appointments a
  WHERE a.barber_id = p_barber_id
    AND a.data = p_appointment_date
    AND a.status = 'agendado'
  ORDER BY a.hora;
END;
$$;

-- 3. Testar a função
SELECT * FROM get_booked_slots(
  '3c8a6678-4711-4e52-8ff6-bf90c454d1c8'::uuid,
  CURRENT_DATE
);

-- 4. Verificar se há dados de teste
SELECT 
  a.hora,
  a.status,
  b.nome as barbeiro
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;

-- 5. Inserir dados de teste (se necessário)
-- Primeiro, desabilitar RLS temporariamente para inserir dados de teste
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Inserir agendamentos de teste
INSERT INTO appointments (cliente_id, barber_id, data, hora, status) VALUES
('00000000-0000-0000-0000-000000000001', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '14:00:00', 'agendado'),
('00000000-0000-0000-0000-000000000002', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '15:00:00', 'agendado'),
('00000000-0000-0000-0000-000000000003', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '16:00:00', 'agendado')
ON CONFLICT DO NOTHING;

-- Reabilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 6. Testar novamente a função
SELECT * FROM get_booked_slots(
  '3c8a6678-4711-4e52-8ff6-bf90c454d1c8'::uuid,
  CURRENT_DATE
);

-- 7. Verificar os dados inseridos
SELECT 
  a.hora,
  a.status,
  b.nome as barbeiro
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;