'use client';

import { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddBarberFormProps {
  createBarber: (data: { nome: string }) => Promise<{ data: any; error: string | null }>;
}

const AddBarberForm = memo(function AddBarberForm({ createBarber }: AddBarberFormProps) {
  const [newBarberName, setNewBarberName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBarber = useCallback(async () => {
    if (!newBarberName.trim()) return;
    
    setLoading(true);
    try {
      const result = await createBarber({ nome: newBarberName });
      if (result.error) {
        console.error('Erro ao criar barbeiro:', result.error);
        toast.error('Erro ao criar barbeiro: ' + result.error);
      } else {
        setNewBarberName('');
        console.log('Barbeiro criado com sucesso:', result.data);
        toast.success(`Barbeiro "${result.data.nome}" criado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
    } finally {
      setLoading(false);
    }
  }, [newBarberName, createBarber]);

  return (
    <Card className="mb-6 bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white">Adicionar Novo Barbeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            placeholder="Nome do barbeiro"
            value={newBarberName}
            onChange={(e) => setNewBarberName(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-white/50 focus:border-slate-500"
          />
          <Button 
            onClick={handleCreateBarber} 
            disabled={loading || !newBarberName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default AddBarberForm;