import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

    const { data: clients, error } = await supabase
      .from('users')
      .select('id, nome, email, created_at')
      .eq('tipo', 'cliente')
      .order('nome');

    if (error) throw error;

    return NextResponse.json(clients);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
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
    const { email, password, nome } = body;

    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Criar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        nome,
        tipo: 'cliente'
      }])
      .select()
      .single();

    if (profileError) {
      // Rollback: deletar usuário do Auth se houver erro ao criar perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json(profile);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
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
    const { id, nome, email } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const updates: { nome?: string; email?: string } = {};
    if (nome) updates.nome = nome;
    if (email) updates.email = email;

    const { data: client, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('tipo', 'cliente')
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(client);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}