-- Criar cliente de teste temporariamente desabilitando RLS

-- Desabilitar RLS temporariamente na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Inserir cliente de teste
INSERT INTO users (id, nome, email, tipo, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Cliente Teste',
  'cliente@teste.com',
  'cliente',
  NOW()
);

-- Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verificar se o cliente foi criado
SELECT * FROM users WHERE tipo = 'cliente';

-- Agora criar o agendamento de teste
INSERT INTO appointments (barber_id, client_id, data_agendamento, horario, status, created_at)
VALUES (
  '3a92b430-5d83-49a8-99d2-99925ef5f253', -- Carlos Oliveira
  '550e8400-e29b-41d4-a716-446655440000', -- Cliente teste
  CURRENT_DATE, -- Hoje
  '15:00:00', -- 15:00
  'agendado',
  NOW()
);

-- Verificar agendamentos criados
SELECT 
  a.*,
  b.nome as barber_name,
  u.nome as client_name
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
JOIN users u ON a.client_id = u.id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.horario;

-- Testar função get_booked_slots
SELECT get_booked_slots('3a92b430-5d83-49a8-99d2-99925ef5f253', CURRENT_DATE);