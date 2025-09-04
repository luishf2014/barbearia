// Teste para criar um agendamento e verificar se aparece na agenda
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function criarAgendamentoTeste() {
  try {
    // Primeiro, buscar um barbeiro ativo
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('status', 'ativo')
      .limit(1);
    
    if (barbersError) {
      console.error('Erro ao buscar barbeiros:', barbersError);
      return;
    }
    
    if (!barbers || barbers.length === 0) {
      console.log('Nenhum barbeiro ativo encontrado');
      return;
    }
    
    console.log('Barbeiro encontrado:', barbers[0]);
    
    // Criar um agendamento de teste para hoje às 14:00
    const hoje = new Date().toISOString().split('T')[0];
    const agendamento = {
      cliente_id: '00000000-0000-0000-0000-000000000001', // ID fictício
      barber_id: barbers[0].id,
      data: hoje,
      hora: '14:00:00',
      status: 'agendado'
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(agendamento)
      .select();
    
    if (error) {
      console.error('Erro ao criar agendamento:', error);
    } else {
      console.log('Agendamento criado com sucesso:', data);
    }
    
    // Testar a função get_booked_slots
    const { data: bookedSlots, error: rpcError } = await supabase
      .rpc('get_booked_slots', {
        selected_date: hoje,
        selected_barber_id: barbers[0].id
      });
    
    if (rpcError) {
      console.error('Erro na função RPC:', rpcError);
    } else {
      console.log('Horários ocupados (RPC):', bookedSlots);
    }
    
    // Testar query direta
    const { data: directQuery, error: directError } = await supabase
      .from('appointments')
      .select('hora')
      .eq('data', hoje)
      .eq('barber_id', barbers[0].id)
      .eq('status', 'agendado');
    
    if (directError) {
      console.error('Erro na query direta:', directError);
    } else {
      console.log('Horários ocupados (query direta):', directQuery);
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

criarAgendamentoTeste();