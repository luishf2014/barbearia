'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Scissors, User, LogOut, Calendar, Settings } from 'lucide-react'

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative bg-white rounded-full p-2">
                <Scissors className="h-6 w-6 text-slate-900" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white font-oswald tracking-wider">CAMISA 10</span>
              <span className="text-xs text-white/70 font-light tracking-widest -mt-1">BARBEARIA</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-all duration-300 hover:text-white relative group ${
                pathname === '/' ? 'text-white' : 'text-white/70'
              }`}
            >
              Home
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                pathname === '/' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
            </Link>
            <Link
              href="/galeria"
              className={`text-sm font-medium transition-all duration-300 hover:text-white relative group ${
                pathname === '/galeria' ? 'text-white' : 'text-white/70'
              }`}
            >
              Galeria
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                pathname === '/galeria' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
            </Link>
            
            {user && (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className={`text-sm font-medium transition-all duration-300 hover:text-white relative group ${
                      pathname.startsWith('/admin') ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    Dashboard
                    <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                      pathname.startsWith('/admin') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}></div>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/agenda"
                      className={`text-sm font-medium transition-all duration-300 hover:text-white relative group ${
                        pathname === '/agenda' ? 'text-white' : 'text-white/70'
                      }`}
                    >
                      Agendar
                      <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                        pathname === '/agenda' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}></div>
                    </Link>
                    <Link
                      href="/meus-agendamentos"
                      className={`text-sm font-medium transition-all duration-300 hover:text-white relative group ${
                        pathname === '/meus-agendamentos' ? 'text-white' : 'text-white/70'
                      }`}
                    >
                      Meus Agendamentos
                      <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                        pathname === '/meus-agendamentos' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}></div>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-white text-slate-900 font-bold">
                        {getInitials(user.profile?.nome || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user.profile?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user.profile?.tipo || 'cliente'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/agenda" className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/meus-agendamentos" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Meus Agendamentos
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/login?mode=login">Entrar</Link>
                </Button>
                <Button className="bg-white text-slate-900 hover:bg-gray-200 font-semibold" asChild>
                  <Link href="/login?mode=signup">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-white/10 bg-slate-800">
          <div className="px-4 py-2 space-y-1">
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/agenda"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/agenda'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Agendar
                </Link>
                <Link
                  href="/meus-agendamentos"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/meus-agendamentos'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Meus Agendamentos
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}