'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { Database, supabase } from '@/lib/supabase'

// Evitar chamadas excessivas ao endpoint de sessão (rate limit)
let lastSessionCheck = 0
const SESSION_CHECK_TTL = 3000 // 3s entre checagens globais

type UserProfile = Database['public']['Tables']['users']['Row']

export interface UserWithProfile extends User {
  profile?: UserProfile
}

export function useAuth() {
  console.log('🚀 useAuth hook chamado!');
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Cache para perfis de usuário - removido do useCallback para evitar dependência circular
  const [profileCache, setProfileCache] = useState<Map<string, UserProfile>>(new Map())

  const getUserWithProfile = useCallback(async (user: User): Promise<UserWithProfile> => {
    try {
      console.log('🔍 Buscando perfil para usuário:', user.id);
      const cachedProfile = profileCache.get(user.id)
      if (cachedProfile) {
        console.log('✅ Perfil encontrado no cache:', cachedProfile);
        return { ...user, profile: cachedProfile }
      }
      console.log('🔍 Buscando perfil no banco de dados...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) {
        console.warn('❌ Erro ao buscar perfil:', error.message);
        return { ...user, profile: undefined };
      }
      console.log('✅ Perfil encontrado no banco:', data);
      if (data) {
        setProfileCache(prev => new Map(prev.set(user.id, data)));
      }
      const userWithProfile = { ...user, profile: data || undefined };
      console.log('✅ Usuário com perfil criado:', userWithProfile);
      return userWithProfile;
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar perfil do usuário:', error)
      return { ...user, profile: undefined }
    }
  }, [])

  useEffect(() => {
    console.log('🔧 Iniciando useAuth useEffect...');
    const initializeAuth = async () => {
      try {
        console.log('🔍 Verificando sessão atual...');
        if (typeof window === 'undefined') {
          console.log('⚠️ Executando no servidor, pulando inicialização');
          return;
        }
        const now = Date.now()
        if (now - lastSessionCheck < SESSION_CHECK_TTL) {
          console.log('⏱️ Pulando getSession para evitar rate limit');
          // Em vez de não fazer nada, tentar obter o usuário atual
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.warn('⚠️ Erro ao obter usuário via getUser:', userError.message);
          }
          if (currentUser) {
            const userWithProfile = await getUserWithProfile(currentUser);
            setUser(userWithProfile);
            console.log('✅ Usuário definido via getUser:', userWithProfile.id);
          }
        } else {
          lastSessionCheck = now
          const { data: sessionData, error } = await supabase.auth.getSession();
          if (error) {
            console.error('❌ Erro ao obter sessão:', error);
            setUser(null);
            setLoading(false);
            return;
          }
          if (sessionData.session?.user) {
            console.log('✅ Sessão encontrada:', sessionData.session.user.id);
            const userWithProfile = await getUserWithProfile(sessionData.session.user);
            setUser(userWithProfile);
            console.log('✅ Usuário definido no estado:', userWithProfile.id);
          } else {
            console.log('❌ Nenhuma sessão encontrada');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro na inicialização da auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 useAuth inicialização finalizada');
      }
    };

    const timer = setTimeout(() => {
      initializeAuth();
    }, 100);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        if (event === 'SIGNED_IN' && session?.user) {
          const userWithProfile = await getUserWithProfile(session.user);
          setUser(userWithProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const userWithProfile = await getUserWithProfile(session.user);
          setUser(userWithProfile);
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Limpando subscription do useAuth');
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [getUserWithProfile])

  const [usersCache, setUsersCache] = useState<{data: UserProfile[] | null, timestamp: number}>({
    data: null,
    timestamp: 0
  });

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const cacheValidityMs = 5 * 60 * 1000; // 5 minutos
      const now = Date.now();
      if (usersCache.data && (now - usersCache.timestamp) < cacheValidityMs) {
        console.log('Usando cache de usuários');
        return usersCache.data;
      }
      console.log('🔍 Buscando todos os usuários no banco de dados...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('nome')
      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return usersCache.data || [];
      }
      const users = data || [];
      console.log('✅ Usuários encontrados:', users.length);
      setUsersCache({
        data: users,
        timestamp: now
      });
      return users;
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar usuários:', error);
      return usersCache.data || [];
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔍 [useAuth] Iniciando signIn com:', { email, password: '***' });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('🔍 [useAuth] Resposta do Supabase:', { 
        data: data ? { user: data.user ? 'presente' : 'ausente', session: data.session ? 'presente' : 'ausente' } : 'null', 
        error: error ? error.message : 'null' 
      });
      if (error) {
        console.error('❌ [useAuth] Erro de autenticação:', error)
        throw error
      }
      if (!data?.user) {
        console.error('❌ [useAuth] Usuário não encontrado nos dados')
        throw new Error('Usuário não encontrado')
      }
      console.log('✅ [useAuth] Usuário autenticado, carregando perfil...');
      const userWithProfile = await getUserWithProfile(data.user)
      console.log('🔍 [useAuth] Perfil carregado:', userWithProfile ? 'sucesso' : 'falhou');
      const finalUser = userWithProfile || { ...data.user, profile: null }
      console.log('✅ [useAuth] Definindo usuário final:', { id: finalUser.id, email: finalUser.email, profile: finalUser.profile ? 'presente' : 'null' });
      setUser(finalUser)
      console.log('✅ [useAuth] Login concluído com sucesso');
      return { data: { ...data, user: finalUser }, error: null }
    } catch (err: unknown) {
      console.error('❌ [useAuth] Erro completo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      return { data: null, error: errorMessage }
    }
  }, [getUserWithProfile])

  const signUp = useCallback(async (email: string, password: string, nome: string, tipo: 'admin' | 'cliente' = 'cliente') => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: isDevelopment ? undefined : `${window.location.origin}/confirm-email`,
          data: {
            nome,
            tipo,
          },
        },
      })
      if (error) throw error
      if (data.user && !data.user.email_confirmed_at) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || email,
            nome,
            tipo
          })
        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }
      return { data, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      return { data: null, error: errorMessage }
    }
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair'
      return { error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar senha'
      return { data: null, error: errorMessage }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha'
      return { data: null, error: errorMessage }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      if (data) {
        setUser({ ...user, profile: data })
      }
      return { data, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      return { data: null, error: errorMessage }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin: user?.profile?.tipo === 'admin',
    isClient: user?.profile?.tipo === 'cliente',
  }
}