'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export interface AuthUser extends User {
  profile?: UserProfile
}

type CreateUserData = {
  email: string
  password: string
  nome: string
  tipo: 'admin' | 'cliente'
}

export function useAuth() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileCache, setProfileCache] = useState<Map<string, UserProfile>>(new Map())

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log('🔐 Verificando sessão atual...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📊 Sessão encontrada:', session)
        
        if (session?.user) {
          console.log('👤 Usuário encontrado, buscando perfil...')
          const userWithProfile = await getUserWithProfile(session.user)
          console.log('✅ Usuário com perfil:', userWithProfile)
          setUser(userWithProfile)
        } else {
          console.log('❌ Nenhuma sessão ativa')
        }
        
        setLoading(false)
      } catch (err) {
        console.error('❌ Erro ao inicializar autenticação:', err)
        setError(err instanceof Error ? err.message : 'Erro ao inicializar autenticação')
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const userWithProfile = await getUserWithProfile(session.user)
            setUser(userWithProfile)
          } else {
            setUser(null)
          }
          setLoading(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao atualizar estado da autenticação')
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUserWithProfile = useCallback(async (user: User): Promise<AuthUser> => {
    try {
      // Verificar cache primeiro
      const cachedProfile = profileCache.get(user.id)
      if (cachedProfile) {
        return { ...user, profile: cachedProfile }
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Adicionar ao cache
      if (profile) {
        setProfileCache(prev => new Map(prev.set(user.id, profile)))
      }

      return { ...user, profile: profile || undefined }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
      return user
    }
  }, [supabase, profileCache])

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('nome')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return []
    }
  }

  const adminCreateUser = useCallback(async ({ email, password, nome, tipo }: CreateUserData) => {
    try {
      setError(null)
      
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          tipo
        }
      })

      if (authError) throw authError

      // Criar perfil na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          nome,
          tipo
        })

      if (profileError) throw profileError

      return { data: authData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar usuário'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Erro de autenticação:', error)
        throw error
      }
      
      if (!data?.user) {
        throw new Error('Usuário não encontrado')
      }

      const userWithProfile = await getUserWithProfile(data.user)
      setUser(userWithProfile)
      
      return { data: { ...data, user: userWithProfile }, error: null }
    } catch (err) {
      console.error('Erro completo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [supabase, getUserWithProfile])

  const signUp = useCallback(async (email: string, password: string, nome: string, tipo: 'admin' | 'cliente' = 'cliente') => {
    try {
      setError(null)
      
      // Para desenvolvimento, desabilitar confirmação de e-mail
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

      // Criar perfil na tabela users se o usuário foi criado com sucesso
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [supabase])

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar senha'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null)
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getAllUsers,
    adminCreateUser,
    isAdmin: user?.profile?.tipo === 'admin',
    isClient: user?.profile?.tipo === 'cliente',
  }
}