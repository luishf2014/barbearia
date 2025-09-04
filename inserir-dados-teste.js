const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inserirDadosTeste() {
  console.log('🧪 Inserindo dados de teste...');
  
  try {
    // Primeiro, vamos buscar o ID do barbeiro existente
    const { data: barbeiros, error: barbeiroError } = await supabase
      .from('barbers')
      .select('id, nome')
      .limit(1);
    
    if (barbeiroError) {
      console.error('❌ Erro ao buscar barbeiro:', barbeiroError);
      return;
    }
    
    if (!barbeiros || barbeiros.length === 0) {
      console.log('❌ Nenhum barbeiro encontrado');
      return;
    }
    
    const barbeiro = barbeiros[0];
    console.log('👨‍💼 Barbeiro encontrado:', barbeiro.nome, '- ID:', barbeiro.id);
    
    // Criar alguns usuários de teste (usando UUIDs fixos)
    const usuariosTeste = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Cliente Teste 1',
        email: 'cliente1@teste.com',
        tipo: 'cliente'
      },
      {
        id: '00000000-0000-0000-0000-000000000002', 
        nome: 'Cliente Teste 2',
        email: 'cliente2@teste.com',
        tipo: 'cliente'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        nome: 'Cliente Teste 3', 
        email: 'cliente3@teste.com',
        tipo: 'cliente'
      }
    ];
    
    // Inserir usuários (pode falhar devido ao RLS, mas vamos tentar)
    console.log('👥 Tentando inserir usuários de teste...');
    for (const usuario of usuariosTeste) {
      const { error: userError } = await supabase
        .from('users')
        .upsert(usuario, { onConflict: 'id' });
      
      if (userError) {
        console.log(`⚠️ Erro ao inserir usuário ${usuario.nome}:`, userError.message);
      } else {
        console.log(`✅ Usuário ${usuario.nome} inserido/atualizado`);
      }
    }
    
    // Obter a data de hoje
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', hoje);
    
    // Criar agendamentos de teste
    const agendamentosTeste = [
      {
        cliente_id: '00000000-0000-0000-0000-000000000001',
        barber_id: barbeiro.id,
        data: hoje,
        hora: '14:00:00',
        status: 'agendado'
      },
      {
        cliente_id: '00000000-0000-0000-0000-000000000002',
        barber_id: barbeiro.id,
        data: hoje,
        hora: '15:00:00',
        status: 'agendado'
      },
      {
        cliente_id: '00000000-0000-0000-0000-000000000003',
        barber_id: barbeiro.id,
        data: hoje,
        hora: '16:00:00',
        status: 'agendado'
      }
    ];
    
    console.log('📅 Tentando inserir agendamentos de teste...');
    for (const agendamento of agendamentosTeste) {
      const { data, error: agendamentoError } = await supabase
        .from('appointments')
        .upsert(agendamento, { 
          onConflict: 'barber_id,data,hora,status',
          ignoreDuplicates: true 
        })
        .select();
      
      if (agendamentoError) {
        console.log(`⚠️ Erro ao inserir agendamento ${agendamento.hora}:`, agendamentoError.message);
      } else {
        console.log(`✅ Agendamento ${agendamento.hora} inserido/atualizado`);
      }
    }
    
    // Verificar os agendamentos inseridos
    console.log('\n🔍 Verificando agendamentos inseridos...');
    const { data: agendamentos, error: consultaError } = await supabase
      .from('appointments')
      .select(`
        *,
        barbers(nome)
      `)
      .eq('data', hoje)
      .order('hora');
    
    if (consultaError) {
      console.error('❌ Erro ao consultar agendamentos:', consultaError);
    } else {
      console.log('📋 Agendamentos encontrados:', agendamentos?.length || 0);
      agendamentos?.forEach(ag => {
        console.log(`  - ${ag.hora} - ${ag.barbers?.nome} - Status: ${ag.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

inserirDadosTeste();