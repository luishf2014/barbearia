'use client';

import { useState, useCallback, memo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback component
const LoadingFallback = () => (
  <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

// Lazy load UI components with loading fallback
const Card = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })), { 
  ssr: false,
  loading: () => <Skeleton className="w-full max-w-md h-96 rounded-lg" />
});
const CardContent = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })), { ssr: false });
const CardDescription = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })), { ssr: false });
const CardHeader = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })), { ssr: false });
const CardTitle = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })), { ssr: false });
const Button = dynamic(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })), { 
  ssr: false,
  loading: () => <Skeleton className="h-9 w-full rounded-md" />
});
const Input = dynamic(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })), { 
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full rounded-md" />
});
const Label = dynamic(() => import("@/components/ui/label").then(mod => ({ default: mod.Label })), { 
  ssr: false,
  loading: () => <Skeleton className="h-4 w-20" />
});

const LoginContent = memo(function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Detectar parâmetro de URL para definir modo inicial
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let willNavigate = false;

    try {
      if (isLogin) {
        console.log('🔍 [LOGIN PAGE] Iniciando login com dados:', { email: formData.email, password: '***' });
        console.log('🔍 [LOGIN PAGE] Função signIn disponível:', typeof signIn);
        
        const { data, error } = await signIn(formData.email, formData.password);
        console.log('🔍 [LOGIN PAGE] Resposta do signIn:', { 
          data: data ? { user: data.user ? 'presente' : 'ausente', session: data.session ? 'presente' : 'ausente' } : 'null', 
          error: error || 'null' 
        });
        
        if (error) {
          console.error('❌ [LOGIN PAGE] Erro no signIn:', error);
          // Tratamento específico para rate limiting
          if (error.includes('rate limit')) {
            throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
          }
          throw new Error(error);
        }
        
        console.log('✅ [LOGIN PAGE] Resposta do signIn completa:', data);
        if (!data?.user?.id) {
          console.error('❌ [LOGIN PAGE] Usuário não encontrado nos dados de retorno');
          throw new Error('Erro ao obter dados do usuário');
        }
        
        console.log('✅ [LOGIN PAGE] Login realizado com sucesso, redirecionando...');
        console.log('🔍 Tipo do usuário:', data.user?.profile?.tipo);
        
        // Manter loading até que a navegação aconteça
        willNavigate = true;
        
        // Redirecionar e forçar refresh do roteador para atualizar SSR
        if (data.user?.profile?.tipo === 'admin') {
          console.log('🔄 Redirecionando admin para dashboard...');
          router.replace('/admin/dashboard');
        } else {
          console.log('🔄 Redirecionando cliente para agenda...');
          router.replace('/agenda');
        }
        // Pequeno delay para garantir que cookies/sessão foram sincronizados
        setTimeout(() => {
          try {
            router.refresh();
          } catch (err) {
            console.warn('Falha ao dar refresh no roteador:', err);
          }
        }, 50);
      } else {
        console.log('Iniciando cadastro...');
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.includes('rate limit')) {
            throw new Error('Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.');
          }
          throw new Error(error);
        }
        console.log('Cadastro realizado com sucesso');
        
        // Manter loading e redirecionar para uma página pública
        willNavigate = true;
        const signupRedirect = '/';
        setTimeout(() => {
          console.log('Redirecionando após cadastro para:', signupRedirect);
          router.push(signupRedirect);
        }, 10);
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      if (!willNavigate) {
        setLoading(false);
      }
    }
  }, [isLogin, formData, signIn, signUp, router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black animate-gradient"></div>
          
          {/* Elementos animados de fundo inspirados na barbearia */}
          <div className="absolute top-6 left-6 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/5 rounded-full animate-float flex items-center justify-center text-white/20 text-lg sm:text-2xl">✂️</div>
          <div className="absolute top-20 right-8 sm:top-32 sm:right-16 w-10 h-10 sm:w-16 sm:h-16 bg-white/10 rounded-full animate-pulse-slow flex items-center justify-center text-white/30 text-base sm:text-xl">💈</div>
          <div className="absolute bottom-16 left-12 sm:bottom-20 sm:left-20 w-8 h-8 sm:w-12 sm:h-12 bg-white/5 rounded-full animate-float flex items-center justify-center text-white/20" style={{animationDelay: '1s'}}>⚡</div>
          <div className="absolute bottom-24 right-20 sm:bottom-32 sm:right-32 w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-full animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Logo/Brand area - Movido para fora do background */}
      <div className="text-center mb-6 sm:mb-8 relative z-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider font-oswald">CAMISA 10</h1>
        <p className="text-white/70 text-xs sm:text-sm font-light tracking-widest">BARBEARIA</p>
        <div className="w-12 sm:w-16 h-0.5 bg-white/50 mx-auto mt-2"></div>
      </div>
      
      <Card className="w-full max-w-sm sm:max-w-md backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl relative z-10 animate-fade-in">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {isLogin ? '✂️ Entrar' : '✂️ Cadastrar'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm sm:text-base px-2">
            {isLogin 
              ? 'Entre com sua conta para agendar um horário'
              : 'Crie sua conta para começar a agendar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <div className="space-y-1 sm:space-y-2 animate-slide-in">
                <Label htmlFor="name" className="text-gray-200 font-medium text-sm sm:text-base">👤 Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            )}

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium text-sm sm:text-base">📧 E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium text-sm sm:text-base">🔒 Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1 sm:space-y-2 animate-slide-in">
                <Label htmlFor="confirmPassword" className="text-gray-200 font-medium text-sm sm:text-base">🔒 Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            )}

            {error && (
              <div className="text-xs sm:text-sm text-red-400 mt-2 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-md animate-shake">
                ⚠️ {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 font-semibold py-2.5 sm:py-3 shadow-lg hover:shadow-xl text-sm sm:text-base h-10 sm:h-11"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Processando...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? '🚪 Entrar' : '✨ Cadastrar'}
                </span>
              )}
            </Button>

            <div className="text-center mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline px-2"
              >
                {isLogin 
                  ? 'Não tem uma conta? Cadastre-se aqui'
                  : 'Já tem uma conta? Faça login aqui'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

const LoginPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;