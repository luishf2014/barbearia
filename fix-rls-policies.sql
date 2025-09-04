-- =============================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS
-- =============================================

-- Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage barbers" ON public.barbers;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;

-- Criar políticas corrigidas sem recursão
-- Política: Admins podem ver todos os usuários (usando auth.jwt())
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tipo' = 'admin'
    OR auth.uid() = id
  );

-- Política: Admins podem inserir novos usuários
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tipo' = 'admin'
  );

-- Política: Admins podem fazer tudo com barbeiros
CREATE POLICY "Admins can manage barbers" ON public.barbers
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tipo' = 'admin'
  );

-- Política: Admins podem ver todos os agendamentos
CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tipo' = 'admin'
    OR cliente_id = auth.uid()
  );

-- Política: Admins podem gerenciar todos os agendamentos
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tipo' = 'admin'
  );

-- =============================================
-- INSTRUÇÕES:
-- =============================================
/*
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute este script completo
4. Teste o login na aplicação

EXPLICAÇÃO DO PROBLEMA:
- As políticas antigas consultavam a própria tabela public.users
- Isso criava recursão infinita quando o Supabase tentava verificar permissões
- As novas políticas usam auth.jwt() para acessar user_metadata diretamente
- Isso evita consultas recursivas e melhora a performance
*/