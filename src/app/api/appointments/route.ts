import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    let query = supabase
      .from('appointments')
      .select(`
        id,
        cliente_id,
        barber_id,
        date,
        time,
        status,
        created_at
      `)
      .order('date')
      .order('time');

    // Se não for admin, filtrar apenas os agendamentos do próprio usuário
    if (!user || user.tipo !== 'admin') {
      query = query.eq('cliente_id', session.user.id);
    }

    const { data: appointments, error } = await query;

    if (error) throw error;

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar agendamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { barberId, clientId, date, time } = body;

    // Validar dados obrigatórios
    if (!barberId || !date || !time) {
      return NextResponse.json(
        { error: 'Barbeiro, data e horário são obrigatórios' },
        { status: 400 }
      );
    }

    // Se não for admin, só pode agendar para si mesmo
    const { data: user } = await supabase
      .from('users')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    const appointmentClientId = user?.tipo === 'admin' ? clientId : session.user.id;

    // Verificar se o horário está disponível
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select()
      .eq('barber_id', barberId)
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'agendado')
      .maybeSingle();

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Horário já está agendado' },
        { status: 400 }
      );
    }

    // Criar agendamento
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([{
        cliente_id: appointmentClientId,
        barber_id: barberId,
        date,
        time,
        status: 'agendado'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão para alterar o agendamento
    const { data: user } = await supabase
      .from('users')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    let query = supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    // Se não for admin, só pode alterar seus próprios agendamentos
    if (!user || user.tipo !== 'admin') {
      query = query.eq('cliente_id', session.user.id);
    }

    const { data: appointment, error } = await query
      .select()
      .single();

    if (error) throw error;

    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado ou sem permissão para alterar' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    );
  }
}