'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import { Scissors, User, LogOut, Calendar, Settings, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    // Navegar para home e forçar refresh para limpar conteúdo protegido
    router.replace('/')
    setTimeout(() => {
      try {
        router.refresh()
      } catch (err) {
        console.warn('Falha ao dar refresh no roteador após logout:', err)
      }
    }, 50)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group" onClick={closeMobileMenu}>
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative bg-white rounded-full p-1.5 md:p-2">
                <Scissors className="h-4 w-4 md:h-6 md:w-6 text-slate-900" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-bold text-white font-oswald tracking-wider">CAMISA 10</span>
              <span className="text-xs text-white/70 font-light tracking-widest -mt-1 hidden sm:block">BARBEARIA</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden text-white hover:bg-white/10 p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-white/10 transition-colors">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarFallback className="bg-white text-slate-900 font-bold text-xs md:text-sm">
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
              <div className="flex items-center space-x-2 md:space-x-3">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white text-xs md:text-sm px-2 md:px-4" asChild>
                  <Link href="/login?mode=login" onClick={closeMobileMenu}>Entrar</Link>
                </Button>
                <Button size="sm" className="bg-white text-slate-900 hover:bg-gray-200 font-semibold text-xs md:text-sm px-2 md:px-4" asChild>
                  <Link href="/login?mode=signup" onClick={closeMobileMenu}>Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-700",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white font-oswald">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileMenu}
              className="text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Main Navigation */}
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === '/'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  🏠 Home
                </Link>
                <Link
                  href="/galeria"
                  onClick={closeMobileMenu}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === '/galeria'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  📸 Galeria
                </Link>
              </div>

              {/* User-specific Navigation */}
              {user && (
                <>
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-2 px-4">Área do {isAdmin ? 'Admin' : 'Cliente'}</p>
                    <div className="space-y-2">
                      {isAdmin ? (
                        <Link
                          href="/admin/dashboard"
                          onClick={closeMobileMenu}
                          className={cn(
                            "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            pathname.startsWith('/admin')
                              ? 'bg-white/20 text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          ⚙️ Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/agenda"
                            onClick={closeMobileMenu}
                            className={cn(
                              "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                              pathname === '/agenda'
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            📅 Agendar
                          </Link>
                          <Link
                            href="/meus-agendamentos"
                            onClick={closeMobileMenu}
                            className={cn(
                              "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                              pathname === '/meus-agendamentos'
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            📋 Meus Agendamentos
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="border-t border-slate-700 pt-4">
                    <div className="px-4 py-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-white text-slate-900 font-bold text-sm">
                            {getInitials(user.profile?.nome || user.email || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.profile?.nome || 'Usuário'}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          handleSignOut()
                          closeMobileMenu()
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-white/70 hover:text-white hover:bg-slate-700 justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Login/Register for non-authenticated users */}
              {!user && (
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:bg-white/10 justify-start"
                    asChild
                  >
                    <Link href="/login?mode=login" onClick={closeMobileMenu}>
                      🔑 Entrar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-white text-slate-900 hover:bg-gray-200 font-semibold"
                    asChild
                  >
                    <Link href="/login?mode=signup" onClick={closeMobileMenu}>
                      ✨ Cadastrar
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}