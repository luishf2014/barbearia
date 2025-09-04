'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export default function ClientesPage() {
  const { getAllUsers } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const users = await getAllUsers();
      setClients(users.filter(user => user.tipo === 'cliente'));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar por nome ou email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Nenhum cliente encontrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map(client => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <div className="space-y-1">
                  <h3 className="font-semibold">{client.nome}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}