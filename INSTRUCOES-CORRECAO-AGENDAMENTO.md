# Instruções para Corrigir o Sistema de Agendamento

Para que os horários ocupados apareçam corretamente como bloqueados, você precisa aplicar as seguintes correções no banco de dados Supabase:

## 1. Aplicar a Função RPC

No painel do Supabase, vá em **SQL Editor** e execute o seguinte código:

```sql
-- Função RPC para obter horários ocupados sem restrições RLS
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
```

## 2. Aplicar Política RLS (Opcional)

Se preferir usar a abordagem de política RLS, execute também:

```sql
-- Política para permitir que todos os usuários autenticados vejam agendamentos
CREATE POLICY "All users can view appointments for availability" ON public.appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

## 3. Como Testar

1. Faça login na aplicação
2. Vá para a página de agendamento
3. Selecione um barbeiro e uma data
4. Crie um agendamento
5. Abra outra aba/navegador e faça login com outro usuário
6. Verifique se o horário agendado aparece como "OCUPADO" e não clicável

## 4. Funcionalidades Implementadas

✅ **Horários ocupados**: Aparecem opacos com label "OCUPADO"
✅ **Horários cancelados**: Voltam a ficar disponíveis automaticamente
✅ **Atualização em tempo real**: Mudanças são refletidas imediatamente
✅ **Interface visual**: Diferenciação clara entre disponível/ocupado

## Arquivos Modificados

- `src/hooks/useAppointments.ts` - Função `getAllSlotsWithStatus` com RPC
- `src/app/agenda/page.tsx` - Interface visual para horários ocupados
- `create-get-booked-slots-function.sql` - Função RPC para o banco
- `fix-appointments-policy.sql` - Política RLS alternativa