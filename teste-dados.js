// Script para testar dados no Supabase
// Execute este arquivo com: node teste-dados.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypuvirwpnyppgszuwwol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarDados() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // 1. Verificar barbeiros
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('status', 'ativo');
    
    console.log('👨‍💼 Barbeiros ativos:', barbers);
    
    if (barbersError) {
      console.error('❌ Erro ao buscar barbeiros:', barbersError);
      return;
    }
    
    if (!barbers || barbers.length === 0) {
      console.log('⚠️ Nenhum barbeiro ativo encontrado. Criando um barbeiro de teste...');
      
      const { data: newBarber, error: createBarberError } = await supabase
        .from('barbers')
        .insert({
          nome: 'João Silva',
          status: 'ativo'
        })
        .select()
        .single();
      
      if (createBarberError) {
        console.error('❌ Erro ao criar barbeiro:', createBarberError);
        return;
      }
      
      console.log('✅ Barbeiro criado:', newBarber);
      barbers.push(newBarber);
    }
    
    const barbeiro = barbers[0];
    const hoje = new Date().toISOString().split('T')[0];
    
    // 2. Verificar agendamentos existentes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barbeiro.id)
      .eq('data', hoje);
    
    console.log('📅 Agendamentos de hoje:', appointments);
    
    // 3. Criar agendamento de teste se não existir
    if (!appointments || appointments.length === 0) {
      console.log('📝 Criando agendamento de teste...');
      
      const { data: newAppointment, error: createError } = await supabase
        .from('appointments')
        .insert({
          cliente_id: '00000000-0000-0000-0000-000000000001',
          barber_id: barbeiro.id,
          data: hoje,
          hora: '14:00:00',
          status: 'agendado'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar agendamento:', createError);
      } else {
        console.log('✅ Agendamento criado:', newAppointment);
      }
    }
    
    // 4. Testar função RPC
    console.log('🔧 Testando função RPC get_booked_slots...');
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_booked_slots', {
        p_barber_id: barbeiro.id,
        p_appointment_date: hoje
      });
    
    if (rpcError) {
      console.error('❌ Erro na função RPC:', rpcError);
    } else {
      console.log('✅ Resultado da função RPC:', rpcData);
    }
    
    // 5. Testar query direta
    console.log('📊 Testando query direta...');
    
    const { data: directData, error: directError } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barbeiro.id)
      .eq('data', hoje)
      .eq('status', 'agendado');
    
    if (directError) {
      console.error('❌ Erro na query direta:', directError);
    } else {
      console.log('✅ Resultado da query direta:', directData);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarDados();