-- Script para inserir dados de teste no Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para inserir dados de teste
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- 2. Inserir usuários de teste
INSERT INTO users (id, nome, email, tipo) VALUES 
('00000000-0000-0000-0000-000000000001', 'Cliente Teste 1', 'cliente1@teste.com', 'cliente'),
('00000000-0000-0000-0000-000000000002', 'Cliente Teste 2', 'cliente2@teste.com', 'cliente'),
('00000000-0000-0000-0000-000000000003', 'Cliente Teste 3', 'cliente3@teste.com', 'cliente')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  tipo = EXCLUDED.tipo;

-- 3. Inserir agendamentos de teste para hoje
INSERT INTO appointments (cliente_id, barber_id, data, hora, status) VALUES 
('00000000-0000-0000-0000-000000000001', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '14:00:00', 'agendado'),
('00000000-0000-0000-0000-000000000002', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '15:00:00', 'agendado'),
('00000000-0000-0000-0000-000000000003', '3c8a6678-4711-4e52-8ff6-bf90c454d1c8', CURRENT_DATE, '16:00:00', 'agendado')
ON CONFLICT (barber_id, data, hora, status) DO NOTHING;

-- 4. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 5. Corrigir a função get_booked_slots para retornar TEXT
DROP FUNCTION IF EXISTS get_booked_slots(uuid, date);

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

-- 6. Testar a função
SELECT * FROM get_booked_slots(
  '3c8a6678-4711-4e52-8ff6-bf90c454d1c8'::uuid,
  CURRENT_DATE
);

-- 7. Verificar os dados inseridos
SELECT
  a.hora,
  a.status,
  b.nome as barbeiro,
  u.nome as cliente
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
JOIN users u ON a.cliente_id = u.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;

-- 8. Verificar se há agendamentos para hoje
SELECT COUNT(*) as total_agendamentos_hoje
FROM appointments 
WHERE data = CURRENT_DATE AND status = 'agendado';