'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'signup' | 'email_change' | 'recovery' | 'invite' | 'magiclink',
          });
          
          if (error) {
            console.error('Erro na confirmação:', error);
            setStatus('error');
            setMessage('Erro ao confirmar e-mail. O link pode ter expirado.');
          } else {
            setStatus('success');
            setMessage('E-mail confirmado com sucesso! Você já pode fazer login.');
          }
        } else {
          setStatus('error');
          setMessage('Link de confirmação inválido.');
        }
      } catch (error) {
        console.error('Erro na confirmação:', error);
        setStatus('error');
        setMessage('Ocorreu um erro ao confirmar seu e-mail.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">
            {status === 'loading' && 'Confirmando e-mail...'}
            {status === 'success' && 'E-mail confirmado!'}
            {status === 'error' && 'Erro na confirmação'}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {status === 'loading' && 'Aguarde enquanto confirmamos seu e-mail.'}
            {status === 'success' && 'Sua conta foi ativada com sucesso.'}
            {status === 'error' && 'Não foi possível confirmar seu e-mail.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status !== 'loading' && (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                {message}
              </p>
              
              <div className="flex flex-col gap-2 sm:gap-3">
                {status === 'success' && (
                  <Button onClick={handleGoToLogin} className="w-full h-9 sm:h-10 text-sm sm:text-base">
                    Fazer Login
                  </Button>
                )}
                
                <Button 
                  variant={status === 'success' ? 'outline' : 'default'} 
                  onClick={handleGoToHome} 
                  className="w-full h-9 sm:h-10 text-sm sm:text-base"
                >
                  Voltar ao Início
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Carregando...</CardTitle>
            <CardDescription className="text-sm sm:text-base">Aguarde enquanto carregamos a página.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}