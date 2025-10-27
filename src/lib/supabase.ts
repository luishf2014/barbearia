import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!')
}

// Cliente para uso no browser - configuração com cookies
export const supabase = createClientComponentClient({
  cookieOptions: {
    name: 'sb-ypuvirwpnyppgszuwwol-auth-token',
    domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  },
  // Forçar sincronização com cookies do servidor
  isSingleton: true
})

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
          status: 'agendado' | 'cancelado' | 'confirmado' | 'pendente'
          created_at: string
          service_id?: string
          preco?: number
        }
        Insert: {
          id?: string
          cliente_id: string
          barber_id: string
          data: string
          hora: string
          status?: 'agendado' | 'cancelado' | 'confirmado' | 'pendente'
          created_at?: string
          service_id?: string
          preco?: number
        }
        Update: {
          id?: string
          cliente_id?: string
          barber_id?: string
          data?: string
          hora?: string
          status?: 'agendado' | 'cancelado' | 'confirmado' | 'pendente'
          created_at?: string
          service_id?: string
          preco?: number
        }
      }
      available_hours: {
        Row: {
          id: string
          barber_id: string
          day_of_week: number
          start_time: string
          end_time: string
          interval_minutes: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barber_id: string
          day_of_week: number
          start_time: string
          end_time: string
          interval_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          interval_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          day_of_week: number
          start_time: string
          end_time: string
          interval_minutes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          start_time: string
          end_time: string
          interval_minutes?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          interval_minutes?: number
          is_active?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          nome: string
          preco: number
          duracao: number
          descricao?: string
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          preco: number
          duracao: number
          descricao?: string
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          preco?: number
          duracao?: number
          descricao?: string
          ativo?: boolean
          created_at?: string
        }
      }
    }
  }
}