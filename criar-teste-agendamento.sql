-- Script para criar um agendamento de teste
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar barbeiros disponíveis
SELECT id, nome FROM barbers WHERE status = 'ativo';

-- 2. Inserir agendamento de teste para HOJE às 14:00
-- Use o ID de um barbeiro ativo da consulta acima
INSERT INTO appointments (
  cliente_id,
  barber_id, 
  data,
  hora,
  status
) VALUES (
  gen_random_uuid(), -- Gera um UUID aleatório para o cliente
  (SELECT id FROM barbers WHERE status = 'ativo' LIMIT 1), -- Primeiro barbeiro ativo
  CURRENT_DATE, -- Data de hoje
  '14:00:00', -- Horário 14:00
  'agendado'
);

-- 3. Verificar se foi criado
SELECT 
  a.id,
  a.data,
  a.hora,
  a.status,
  b.nome as barbeiro
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE a.data = CURRENT_DATE;

-- 4. Testar a função RPC
SELECT * FROM get_booked_slots(
  (SELECT id FROM barbers WHERE status = 'ativo' LIMIT 1),
  CURRENT_DATE
);

-- 5. Inserir mais alguns horários ocupados para teste
INSERT INTO appointments (cliente_id, barber_id, data, hora, status) VALUES
(gen_random_uuid(), (SELECT id FROM barbers WHERE status = 'ativo' LIMIT 1), CURRENT_DATE, '15:00:00', 'agendado'),
(gen_random_uuid(), (SELECT id FROM barbers WHERE status = 'ativo' LIMIT 1), CURRENT_DATE, '16:00:00', 'agendado');

-- 6. Verificar todos os agendamentos de hoje
SELECT 
  a.hora,
  a.status,
  b.nome as barbeiro
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;