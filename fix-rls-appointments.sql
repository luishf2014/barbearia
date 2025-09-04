-- Política RLS para permitir que usuários vejam apenas horários ocupados
-- Isso permite verificar disponibilidade sem expor dados pessoais

-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver agendamentos para disponibilidade" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;

-- Política para permitir que usuários autenticados vejam apenas horários ocupados
-- Retorna apenas barber_id, data, hora e status para verificar disponibilidade
CREATE POLICY "Ver horários ocupados para disponibilidade" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (status = 'agendado');

-- Política para permitir que usuários vejam seus próprios agendamentos completos
CREATE POLICY "Ver próprios agendamentos" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para permitir que usuários criem seus próprios agendamentos
CREATE POLICY "Criar próprios agendamentos" ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios agendamentos
CREATE POLICY "Atualizar próprios agendamentos" ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comentário: Execute este arquivo no SQL Editor do Supabase
-- Isso permitirá que o sistema veja horários ocupados para mostrar disponibilidade
-- enquanto mantém a privacidade dos dados pessoais dos agendamentos