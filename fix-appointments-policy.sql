-- Política para permitir que todos os usuários autenticados vejam agendamentos
-- Isso é necessário para verificar disponibilidade de horários

CREATE POLICY "All users can view appointments for availability" ON public.appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);