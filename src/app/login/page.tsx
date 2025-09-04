'use client';

import { useState, useCallback, memo, useEffect } from 'react';
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

const LoginPage = memo(function LoginPage() {
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

    try {
      if (isLogin) {
        console.log('Iniciando login...');
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Erro no signIn:', error);
          throw new Error(error);
        }
        
        console.log('Resposta do signIn:', data);
        if (!data?.user?.id) {
          console.error('Usuário não encontrado nos dados de retorno');
          throw new Error('Erro ao obter dados do usuário');
        }
        
        if (data.user.profile?.tipo === 'admin') {
          console.log('Redirecionando para dashboard admin...');
          router.push('/admin/dashboard');
        } else {
          console.log('Redirecionando para agenda...');
          router.push('/agenda');
        }
      } else {
        console.log('Iniciando cadastro...');
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        await signUp(formData.email, formData.password, formData.name);
        console.log('Cadastro realizado com sucesso');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  }, [isLogin, formData, signIn, signUp, router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black animate-gradient"></div>
          
          {/* Elementos animados de fundo inspirados na barbearia */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-float flex items-center justify-center text-white/20 text-2xl">✂️</div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-pulse-slow flex items-center justify-center text-white/30 text-xl">💈</div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/5 rounded-full animate-float flex items-center justify-center text-white/20" style={{animationDelay: '1s'}}>⚡</div>
          <div className="absolute bottom-32 right-32 w-8 h-8 bg-white/10 rounded-full animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Logo/Brand area - Movido para fora do background */}
      <div className="text-center mb-8 relative z-20">
        <h1 className="text-4xl font-bold text-white tracking-wider font-oswald">CAMISA 10</h1>
        <p className="text-white/70 text-sm font-light tracking-widest">BARBEARIA</p>
        <div className="w-16 h-0.5 bg-white/50 mx-auto mt-2"></div>
      </div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl relative z-10 animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {isLogin ? '✂️ Entrar' : '✂️ Cadastrar'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            {isLogin 
              ? 'Entre com sua conta para agendar um horário'
              : 'Crie sua conta para começar a agendar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2 animate-slide-in">
                <Label htmlFor="name" className="text-gray-200 font-medium">👤 Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium">📧 E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium">🔒 Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-slide-in">
                <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">🔒 Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white/20 transition-all duration-300 hover:bg-white/10"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md animate-shake">
                ⚠️ {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 font-semibold py-3 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Processando...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? '🚪 Entrar' : '✨ Cadastrar'}
                </span>
              )}
            </Button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline"
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

export default LoginPage;