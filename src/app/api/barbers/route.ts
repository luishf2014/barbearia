import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: barbers, error } = await supabase
      .from('barbers')
      .select('*')
      .order('nome');

    if (error) throw error;

    return NextResponse.json(barbers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar barbeiros' },
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
    const { nome } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const { data: barber, error } = await supabase
      .from('barbers')
      .insert([{ nome, status: 'ativo' }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(barber);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar barbeiro' },
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
    const { id, nome, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const updates: { nome?: string; status?: 'ativo' | 'inativo' } = {};
    if (nome) updates.nome = nome;
    if (status) updates.status = status;

    const { data: barber, error } = await supabase
      .from('barbers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(barber);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar barbeiro' },
      { status: 500 }
    );
  }
}