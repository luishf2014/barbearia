// Script para verificar estrutura das tabelas
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstrutura() {
  console.log('🔍 Verificando estrutura das tabelas...');
  
  try {
    // Tentar buscar um registro da tabela appointments para ver as colunas
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Erro ao buscar appointments:', appointmentsError);
    } else {
      console.log('📋 Estrutura appointments:', appointments);
      if (appointments && appointments.length > 0) {
        console.log('🔑 Colunas disponíveis:', Object.keys(appointments[0]));
      } else {
        console.log('📭 Tabela appointments vazia');
      }
    }
    
    // Verificar barbeiros
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .limit(1);
    
    if (barbersError) {
      console.error('❌ Erro ao buscar barbers:', barbersError);
    } else {
      console.log('👨‍💼 Estrutura barbers:', barbers);
      if (barbers && barbers.length > 0) {
        console.log('🔑 Colunas disponíveis:', Object.keys(barbers[0]));
      }
    }
    
    // Verificar usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar users:', usersError);
    } else {
      console.log('👤 Estrutura users:', users);
      if (users && users.length > 0) {
        console.log('🔑 Colunas disponíveis:', Object.keys(users[0]));
      } else {
        console.log('📭 Tabela users vazia');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarEstrutura();