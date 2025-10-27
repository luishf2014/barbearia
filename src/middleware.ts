import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Ignorar middleware para rotas públicas e assets
  const publicRoutes = ['/login', '/', '/galeria']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '?')
  )
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Erro na sessão:', sessionError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se não há sessão, redirecionar para login
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Erro na autenticação:', authError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rotas protegidas
    const protectedRoutes = ['/agenda', '/meus-agendamentos', '/admin']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    console.log('Rota atual:', request.nextUrl.pathname)
    console.log('É rota protegida:', isProtectedRoute)
    console.log('Usuário autenticado:', !!user)

    // Se não está autenticado e tenta acessar rota protegida
    if (isProtectedRoute && !user) {
      console.log('Redirecionando para login: usuário não autenticado em rota protegida')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se está autenticado, verificar tipo de usuário apenas para rotas específicas
    if (user && isProtectedRoute) {
      console.log('Verificando tipo do usuário...')
      
      // Aguardar um pouco para garantir que a sessão esteja completamente estabelecida
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tipo')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError)
        // Não redirecionar imediatamente em caso de erro, permitir que a página carregue
        console.log('Permitindo acesso mesmo com erro na busca do perfil')
        return response
      }

      console.log('Tipo do usuário:', userData?.tipo)

      // Redirecionamento baseado no tipo de usuário - apenas se for uma tentativa clara de acesso incorreto
      if (request.nextUrl.pathname.startsWith('/admin') && userData?.tipo !== 'admin') {
        console.log('Redirecionando: usuário não admin tentando acessar área admin')
        return NextResponse.redirect(new URL('/agenda', request.url))
      }

      if (request.nextUrl.pathname === '/agenda' && userData?.tipo === 'admin') {
        console.log('Redirecionando: admin tentando acessar área de cliente')
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Erro no middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}