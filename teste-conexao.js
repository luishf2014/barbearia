// Teste simples de conectividade com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  console.log('🔍 Testando conexão básica com Supabase...');
  
  try {
    // Teste simples - buscar barbeiros
    console.log('👨‍💼 Buscando barbeiros...');
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('status', 'ativo')
      .order('nome', { ascending: true });
    
    if (barbersError) {
      console.error('❌ Erro ao buscar barbeiros:', barbersError);
    } else {
      console.log('✅ Barbeiros encontrados:', barbers);
    }
    
    // Teste de autenticação
    console.log('🔐 Verificando sessão...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError);
    } else {
      console.log('✅ Sessão:', session?.session ? 'Ativa' : 'Inativa');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarConexao();