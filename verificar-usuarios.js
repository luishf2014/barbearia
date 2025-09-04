// Script para verificar usuários existentes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarUsuarios() {
  console.log('👥 Verificando usuários existentes...');
  
  try {
    // Buscar todos os usuários
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .order('created_at');
    
    if (usuariosError) {
      console.error('❌ Erro ao buscar usuários:', usuariosError);
      return;
    }
    
    console.log('📊 Usuários encontrados:', usuarios);
    console.log('📈 Total de usuários:', usuarios?.length || 0);
    
    // Verificar usuários por tipo
    const clientes = usuarios?.filter(u => u.tipo === 'cliente') || [];
    const admins = usuarios?.filter(u => u.tipo === 'admin') || [];
    
    console.log('👤 Clientes:', clientes.length);
    console.log('👨‍💼 Admins:', admins.length);
    
    if (clientes.length === 0) {
      console.log('⚠️ Nenhum cliente encontrado. Criando cliente de teste...');
      
      // Criar cliente de teste
      const { data: novoCliente, error: criarError } = await supabase
        .from('users')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000', // UUID fixo para teste
          nome: 'Cliente Teste',
          email: 'cliente@teste.com',
          tipo: 'cliente'
        })
        .select()
        .single();
      
      if (criarError) {
        console.error('❌ Erro ao criar cliente:', criarError);
      } else {
        console.log('✅ Cliente de teste criado:', novoCliente);
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarUsuarios();