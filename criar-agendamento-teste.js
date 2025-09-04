// Script para criar agendamento de teste
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarAgendamentoTeste() {
  console.log('📅 Criando agendamento de teste...');
  
  try {
    // Buscar primeiro cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('users')
      .select('id, nome')
      .eq('tipo', 'cliente')
      .limit(1)
      .single();
    
    if (clienteError) {
      console.error('❌ Erro ao buscar cliente:', clienteError);
      return;
    }
    
    console.log('👤 Cliente encontrado:', cliente);
    
    // Criar agendamento para hoje às 15:00
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('appointments')
      .insert({
        barber_id: '3a92b430-5d83-49a8-99d2-99925ef5f253', // Carlos Oliveira
        client_id: cliente.id,
        data_agendamento: hoje,
        horario: '15:00:00',
        status: 'agendado'
      })
      .select()
      .single();
    
    if (agendamentoError) {
      console.error('❌ Erro ao criar agendamento:', agendamentoError);
      return;
    }
    
    console.log('✅ Agendamento criado:', agendamento);
    
    // Verificar agendamentos de hoje
    const { data: agendamentosHoje, error: consultaError } = await supabase
      .from('appointments')
      .select(`
        *,
        barbers(nome),
        users(nome)
      `)
      .eq('data_agendamento', hoje)
      .order('horario');
    
    if (consultaError) {
      console.error('❌ Erro ao consultar agendamentos:', consultaError);
      return;
    }
    
    console.log('📋 Agendamentos de hoje:', agendamentosHoje);
    
    // Testar função get_booked_slots
    const { data: horariosOcupados, error: funcaoError } = await supabase
      .rpc('get_booked_slots', {
        barber_id: '3a92b430-5d83-49a8-99d2-99925ef5f253',
        appointment_date: hoje
      });
    
    if (funcaoError) {
      console.error('❌ Erro na função get_booked_slots:', funcaoError);
      return;
    }
    
    console.log('🕐 Horários ocupados (função RPC):', horariosOcupados);
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

criarAgendamentoTeste();