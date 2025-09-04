import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!')
}

// Configuração para lidar com limite de taxa
const retryConfig = {
  maxRetries: 3,
  initialBackoffMs: 500,
  maxBackoffMs: 10000
}

// Cliente para uso no browser com configuração de retry
export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
  options: {
    global: {
      fetch: async (url, options) => {
        let retries = 0
        let backoffMs = retryConfig.initialBackoffMs
        
        while (true) {
          try {
            const response = await fetch(url, options)
            
            // Se receber erro de limite de taxa, tenta novamente
            if (response.status === 429 && retries < retryConfig.maxRetries) {
              retries++
              console.log(`Rate limit reached. Retrying in ${backoffMs}ms (${retries}/${retryConfig.maxRetries})`)
              
              // Espera com backoff exponencial
              await new Promise(resolve => setTimeout(resolve, backoffMs))
              
              // Aumenta o tempo de espera para a próxima tentativa (backoff exponencial)
              backoffMs = Math.min(backoffMs * 2, retryConfig.maxBackoffMs)
              continue
            }
            
            return response
          } catch (error) {
            if (retries < retryConfig.maxRetries) {
              retries++
              console.log(`Fetch error. Retrying in ${backoffMs}ms (${retries}/${retryConfig.maxRetries})`, error)
              
              await new Promise(resolve => setTimeout(resolve, backoffMs))
              backoffMs = Math.min(backoffMs * 2, retryConfig.maxBackoffMs)
              continue
            }
            throw error
          }
        }
      }
    }
  }
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
    }
  }
}