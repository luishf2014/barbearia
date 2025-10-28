'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import type { Client } from '@/hooks/useClients';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Users, Mail, Calendar } from 'lucide-react';
import { Toaster } from 'sonner';

export default function ClientesPage() {
  const { clients, loading, error, refreshClients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce do termo de busca para melhorar performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Debug logs
  console.log('🏠 ClientesPage render:', { clients, loading, error, clientsLength: clients?.length });

  // Memoizar filtragem para evitar recálculos desnecessários
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!debouncedSearchTerm.trim()) return clients;
    
    return clients.filter((client: Client) => 
      client.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [clients, debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <Toaster richColors position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-10 px-8 rounded-xl mb-12 border border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <Users className="h-6 w-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald">GERENCIAR CLIENTES</h1>
          </div>
          <p className="text-xl text-white/80">
            Visualize e gerencie todos os clientes da barbearia
          </p>
        </div>
      </div>

      <Card className="mb-6 bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white">Filtrar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
            <Input
              placeholder="Buscar por nome ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-white/50 focus:border-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
          <div className="animate-pulse flex flex-col items-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <p className="font-medium text-lg text-white">Carregando clientes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 bg-slate-700/30 rounded-xl border border-red-900">
          <div className="flex flex-col items-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <p className="font-medium text-lg text-white">{error}</p>
            <Button 
              onClick={refreshClients}
              variant="outline"
              className="mt-4 bg-red-900/20 border-red-900 text-white hover:bg-red-900/40"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client: Client) => (
            <Card key={client.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h2 className="font-semibold text-white text-lg">{client.nome || 'Cliente sem nome'}</h2>
                  <div className="flex items-center text-sm text-white/60">
                    <Mail className="h-3 w-3 mr-2" />
                    <span>{client.email}</span>
                  </div>

                  <div className="flex items-center text-sm text-white/60">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span>Cliente desde: {new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && filteredClients.length === 0 && (
            <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700 col-span-full">
              <Users className="h-16 w-16 mx-auto mb-4 text-white/40" />
              <p className="font-medium text-lg text-white">
                {searchTerm
                  ? 'Nenhum cliente encontrado com o termo de busca'
                  : 'Nenhum cliente cadastrado'}
              </p>
              <p className="text-sm mt-2">Os clientes aparecerão aqui quando forem cadastrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}