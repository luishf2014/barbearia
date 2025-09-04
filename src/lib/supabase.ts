import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são necessários')
}

// Cliente para uso no browser
export const supabase = createClientComponentClient()

// Função para determinar o redirecionamento após login
export const getRedirectURL = (tipo: string | null) => {
  if (!tipo) return '/'
  
  switch (tipo) {
    case 'admin':
      return '/admin/dashboard'
    case 'cliente':
      return '/agenda'
    default:
      return '/'
  }
}

// Lista de rotas protegidas que requerem autenticação
export const getProtectedRoutes = () => [
  '/agenda',
  '/meus-agendamentos',
  '/admin',
  '/admin/dashboard',
  '/admin/agendamentos',
  '/admin/barbeiros',
  '/admin/clientes',
  '/admin/novo-cliente',
  '/admin/novo-agendamento'
]

// Lista de rotas que requerem permissão de admin
export const getAdminRoutes = () => [
  '/admin',
  '/admin/dashboard',
  '/admin/agendamentos',
  '/admin/barbeiros',
  '/admin/clientes',
  '/admin/novo-cliente',
  '/admin/novo-agendamento'
]

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nome: string
          email: string
          tipo: 'admin' | 'cliente'
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          tipo: 'admin' | 'cliente'
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          tipo?: 'admin' | 'cliente'
          created_at?: string
        }
      }
      barbers: {
        Row: {
          id: string
          nome: string
          status: 'ativo' | 'inativo'
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          status?: 'ativo' | 'inativo'
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          status?: 'ativo' | 'inativo'
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          cliente_id: string
          barber_id: string
          data: string
          hora: string
          status: 'agendado' | 'cancelado'
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          barber_id: string
          data: string
          hora: string
          status?: 'agendado' | 'cancelado'
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          barber_id?: string
          data?: string
          hora?: string
          status?: 'agendado' | 'cancelado'
          created_at?: string
        }
      }
    }
  }
}