'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useBarbers } from '@/hooks/useBarbers';
import { Scissors, CheckCircle, XCircle } from 'lucide-react';

export default function BarbeirosPage() {
  const { barbers, createBarber, updateBarber } = useBarbers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newBarberName, setNewBarberName] = useState('');

  const handleCreateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) {
      setError('Nome do barbeiro é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBarber({
        nome: newBarberName,
        status: 'ativo'
      });
      setNewBarberName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar barbeiro');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (barberId: string, currentStatus: string) => {
    setLoading(true);
    setError('');

    try {
      await updateBarber(barberId, {
        status: currentStatus === 'ativo' ? 'inativo' : 'ativo'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Barbeiros</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Barbeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBarber} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Barbeiro</Label>
                <Input
                  id="name"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  placeholder="Digite o nome do barbeiro"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Barbeiro'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Barbeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {barbers?.map((barber) => (
                <div
                  key={barber.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Scissors className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{barber.nome}</p>
                      <Badge
                        variant={barber.status === 'ativo' ? 'default' : 'secondary'}
                      >
                        {barber.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(barber.id, barber.status)}
                    disabled={loading}
                  >
                    {barber.status === 'ativo' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </Button>
                </div>
              ))}

              {(!barbers || barbers.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum barbeiro cadastrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}