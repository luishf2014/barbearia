import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');
    
    if (!barberId) {
      return NextResponse.json(
        { error: 'ID do barbeiro é obrigatório' },
        { status: 400 }
      );
    }

    const { data: availableHours, error } = await supabase
      .from('available_hours')
      .select('*')
      .eq('barber_id', barberId)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    return NextResponse.json(availableHours);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar horários disponíveis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
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

    if (!user || user.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { barber_id, day_of_week, start_time, end_time, interval_minutes, is_active } = body;

    // Validar campos obrigatórios
    if (!barber_id || day_of_week === undefined || !start_time || !end_time || !interval_minutes) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const { data: availableHour, error } = await supabase
      .from('available_hours')
      .insert([{ 
        barber_id, 
        day_of_week, 
        start_time, 
        end_time, 
        interval_minutes, 
        is_active: is_active !== undefined ? is_active : true 
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(availableHour);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar horário disponível' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
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

    if (!user || user.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, barber_id, day_of_week, start_time, end_time, interval_minutes, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (barber_id) updates.barber_id = barber_id;
    if (day_of_week !== undefined) updates.day_of_week = day_of_week;
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (interval_minutes) updates.interval_minutes = interval_minutes;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: availableHour, error } = await supabase
      .from('available_hours')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(availableHour);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar horário disponível' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
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

    if (!user || user.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('available_hours')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir horário disponível' },
      { status: 500 }
    );
  }
}