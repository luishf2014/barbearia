-- =============================================
-- SENHA SUPABASE --> Barbearia2025
-- =============================================

-- =============================================
-- SETUP DO BANCO DE DADOS SUPABASE
-- =============================================

-- Habilitar Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- TABELA USERS (integrada ao Supabase Auth)
-- =============================================

-- Criar tabela users que estende auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tipo TEXT CHECK (tipo IN ('admin', 'cliente')) DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Política: Admins podem inserir novos usuários
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- =============================================
-- TABELA BARBERS
-- =============================================

CREATE TABLE public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela barbers
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver barbeiros ativos
CREATE POLICY "Everyone can view active barbers" ON public.barbers
  FOR SELECT USING (status = 'ativo');

-- Política: Admins podem fazer tudo com barbeiros
CREATE POLICY "Admins can manage barbers" ON public.barbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- =============================================
-- TABELA APPOINTMENTS
-- =============================================

CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status TEXT CHECK (status IN ('agendado', 'cancelado')) DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barber_id, data, hora, status) -- Evita duplo agendamento no mesmo horário
);

-- Habilitar RLS na tabela appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Política: Clientes podem ver apenas seus próprios agendamentos
CREATE POLICY "Clients can view own appointments" ON public.appointments
  FOR SELECT USING (cliente_id = auth.uid());

-- Política: Todos os usuários autenticados podem ver agendamentos para verificar disponibilidade
CREATE POLICY "All users can view appointments for availability" ON public.appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política: Clientes podem inserir agendamentos para si mesmos
CREATE POLICY "Clients can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (cliente_id = auth.uid());

-- Política: Clientes podem cancelar seus próprios agendamentos
CREATE POLICY "Clients can cancel own appointments" ON public.appointments
  FOR UPDATE USING (cliente_id = auth.uid())
  WITH CHECK (cliente_id = auth.uid() AND status = 'cancelado');

-- Política: Admins podem ver todos os agendamentos
CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Política: Admins podem gerenciar todos os agendamentos
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após inserção na auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INSERIR DADOS INICIAIS
-- =============================================

-- Inserir barbeiros iniciais
INSERT INTO public.barbers (nome, status) VALUES
  ('João Silva', 'ativo'),
  ('Pedro Santos', 'ativo'),
  ('Carlos Oliveira', 'ativo');

-- =============================================
-- HABILITAR REALTIME
-- =============================================

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.barbers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================

/*
PARA USAR ESTE SCRIPT:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole e execute este script
4. Verifique se todas as tabelas foram criadas
5. Teste as políticas RLS

PARA CRIAR UM ADMIN:
1. Registre um usuário normalmente
2. No SQL Editor, execute:
   UPDATE public.users SET tipo = 'admin' WHERE email = 'seu-email@exemplo.com';

HORÁRIOS DISPONÍVEIS:
- Segunda a Sexta: 08:00 às 18:00
- Sábado: 08:00 às 16:00
- Domingo: Fechado
- Intervalos de 30 minutos
*/