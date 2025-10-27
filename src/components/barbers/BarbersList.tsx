'use client';

import { useState, useMemo, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scissors, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Barber = Database['public']['Tables']['barbers']['Row'];

interface BarbersListProps {
  barbers: Barber[] | null;
  searchTerm: string;
  updateBarber: (id: string, data: Partial<Barber>) => Promise<{ data: any; error: string | null }>;
  deleteBarber: (id: string) => Promise<{ data: any; error: string | null }>;
}

function BarbersList({ barbers, searchTerm, updateBarber, deleteBarber }: BarbersListProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Memoizar a filtragem dos barbeiros para evitar recálculos desnecessários
  const filteredBarbers = useMemo(() => {
    if (!barbers) return [];
    if (!searchTerm.trim()) return barbers;
    
    return barbers.filter(barber => 
      barber.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [barbers, searchTerm]);

  const handleToggleStatus = async (barberId: string, currentStatus: string) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      const result = await updateBarber(barberId, { status: newStatus });
      if (result.error) {
        console.error('Erro ao atualizar status do barbeiro:', result.error);
        toast.error('Erro ao atualizar status: ' + result.error);
      } else {
        console.log('Status do barbeiro atualizado:', result.data);
        const statusText = newStatus === 'ativo' ? 'ativado' : 'desativado';
        toast.success(`Barbeiro "${result.data.nome}" ${statusText} com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status do barbeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (barber: Barber) => {
    setEditingId(barber.id);
    setEditingName(barber.nome);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await updateBarber(id, { nome: editingName.trim() });
      
      if (error) {
        toast.error(`Erro ao alterar nome: ${error}`);
      } else {
        toast.success('Nome alterado com sucesso');
        setEditingId(null);
        setEditingName('');
      }
    } catch (error) {
      console.error('Erro ao alterar nome:', error);
      toast.error('Erro inesperado ao alterar nome');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarber = async (barber: Barber) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir "${barber.nome}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await deleteBarber(barber.id);
      if (error) {
        toast.error(`Erro ao excluir barbeiro: ${error}`);
      } else {
        toast.success(`Barbeiro "${data?.nome ?? barber.nome}" excluído (inativado).`);
      }
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      toast.error('Erro inesperado ao excluir barbeiro');
    } finally {
      setLoading(false);
    }
  };

  if (!barbers) {
    return (
      <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
        <Scissors className="h-16 w-16 mx-auto mb-4 text-white/40" />
        <p className="font-medium text-lg">Carregando barbeiros...</p>
      </div>
    );
  }

  if (filteredBarbers.length === 0) {
    return (
      <div className="text-center py-20 text-white/60 bg-slate-700/30 rounded-xl border border-slate-700">
        <Scissors className="h-16 w-16 mx-auto mb-4 text-white/40" />
        <p className="font-medium text-lg">Nenhum barbeiro encontrado</p>
        <p className="text-sm mt-2">{searchTerm ? 'Tente ajustar sua busca' : 'Adicione barbeiros para começar'}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredBarbers.map(barber => (
        <Card key={barber.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center space-x-2 flex-1">
                {editingId === barber.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(barber.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(barber.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white p-2"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <h2 className="font-semibold text-white text-lg flex-1">{barber.nome}</h2>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(barber)}
                      disabled={loading}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 p-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBarber(barber)}
                      disabled={loading}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <Badge 
                variant={barber.status === 'ativo' ? 'default' : 'secondary'}
                className={barber.status === 'ativo' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500/20 text-red-500'}
              >
                {barber.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-white/60">Status</span>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={barber.status === 'ativo'}
                  onCheckedChange={() => handleToggleStatus(barber.id, barber.status)}
                  disabled={loading}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className="text-sm text-white/80">
                  {barber.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Memoizar o componente para evitar re-renderizações desnecessárias
export default memo(BarbersList);