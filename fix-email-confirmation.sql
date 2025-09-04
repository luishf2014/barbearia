-- =============================================
-- SCRIPT PARA CORRIGIR CONFIRMAÇÃO DE EMAIL
-- =============================================

-- 1. Verificar usuários com email não confirmado
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 2. Confirmar emails de todos os usuários existentes
-- ATENÇÃO: Execute apenas em desenvolvimento!
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Verificar se a correção funcionou
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users;

-- =============================================
-- INSTRUÇÕES:
-- =============================================
/*
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute primeiro o comando SELECT para ver os usuários não confirmados
4. Execute o UPDATE para confirmar todos os emails
5. Execute o último SELECT para verificar se funcionou
6. Teste o login na aplicação

IMPORTANTE: 
- Este script deve ser usado apenas em desenvolvimento
- Em produção, mantenha a confirmação de email ativada
- Após corrigir, desabilite "Confirm email" no painel do Supabase:
  Authentication > Providers > Email > Confirm email = OFF
*/