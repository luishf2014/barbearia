// Script simples para testar agendamento
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testeSimples() {
  console.log('🧪 Teste simples de agendamento...');
  
  try {
    // Testar função get_booked_slots diretamente
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', hoje);
    
    const { data: horariosOcupados, error: funcaoError } = await supabase
      .rpc('get_booked_slots', {
        p_barber_id: '3a92b430-5d83-49a8-99d2-99925ef5f253',
        p_appointment_date: hoje
      });
    
    if (funcaoError) {
      console.error('❌ Erro na função get_booked_slots:', funcaoError);
    } else {
      console.log('🕐 Horários ocupados (função RPC):', horariosOcupados);
    }
    
    // Verificar agendamentos existentes
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('appointments')
      .select('*')
      .eq('data', hoje)
      .order('hora');
    
    if (agendamentosError) {
      console.error('❌ Erro ao buscar agendamentos:', agendamentosError);
    } else {
      console.log('📋 Agendamentos existentes:', agendamentos);
    }
    
    // Verificar se há algum agendamento para o horário 15:00
    const agendamento15h = agendamentos?.find(a => a.hora === '15:00:00');
    if (agendamento15h) {
      console.log('✅ Agendamento às 15:00 encontrado:', agendamento15h);
    } else {
      console.log('❌ Nenhum agendamento às 15:00 encontrado');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testeSimples();