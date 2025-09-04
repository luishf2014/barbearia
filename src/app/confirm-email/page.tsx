'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
    <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Confirmando e-mail...'}
            {status === 'success' && 'E-mail confirmado!'}
            {status === 'error' && 'Erro na confirmação'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Aguarde enquanto confirmamos seu e-mail.'}
            {status === 'success' && 'Sua conta foi ativada com sucesso.'}
            {status === 'error' && 'Não foi possível confirmar seu e-mail.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status !== 'loading' && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                {message}
              </p>
              
              <div className="flex flex-col gap-2">
                {status === 'success' && (
                  <Button onClick={handleGoToLogin} className="w-full">
                    Fazer Login
                  </Button>
                )}
                
                <Button 
                  variant={status === 'success' ? 'outline' : 'default'} 
                  onClick={handleGoToHome} 
                  className="w-full"
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
      <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>Aguarde enquanto carregamos a página.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}