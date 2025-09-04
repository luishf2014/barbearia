'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Scissors, Camera, Star, Sparkles, Award, Heart } from "lucide-react";
import Link from "next/link";

const galleryItems = [
  {
    id: 1,
    title: "Corte Clássico",
    description: "Corte tradicional com acabamento impecável",
    imageUrl: "https://source.unsplash.com/random/800x600/?classic+haircut",
    tags: ["Clássico", "Tradicional"]
  },
  {
    id: 2,
    title: "Barba Moderna",
    description: "Modelagem e aparamento de barba com técnicas modernas",
    imageUrl: "https://source.unsplash.com/random/800x600/?beard+trim",
    tags: ["Barba", "Moderno"]
  },
  {
    id: 3,
    title: "Degradê",
    description: "Corte degradê com transições suaves",
    imageUrl: "https://source.unsplash.com/random/800x600/?fade+haircut",
    tags: ["Degradê", "Moderno"]
  },
  {
    id: 4,
    title: "Corte + Barba",
    description: "Combo completo de corte e barba",
    imageUrl: "https://source.unsplash.com/random/800x600/?haircut+beard",
    tags: ["Combo", "Premium"]
  },
  {
    id: 5,
    title: "Platinado",
    description: "Descoloração e tonalização",
    imageUrl: "https://source.unsplash.com/random/800x600/?platinum+hair",
    tags: ["Coloração", "Moderno"]
  },
  {
    id: 6,
    title: "Corte Infantil",
    description: "Especializado em cortes para crianças",
    imageUrl: "https://source.unsplash.com/random/800x600/?kids+haircut",
    tags: ["Infantil", "Especializado"]
  }
];

export default function GaleriaPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-white rounded-full p-3">
              <Camera className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald">
              NOSSA GALERIA
            </h1>
          </div>
          <p className="text-xl text-white/80 mb-8">
            Conheça alguns dos nossos trabalhos e estilos disponíveis na Camisa 10 Barbearia
          </p>
          {!user && (
            <Link href="/login">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-bold px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto w-fit">
                <Scissors className="h-5 w-5" />
                <span>AGENDE SEU HORÁRIO</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => {
            const icons = [Scissors, Star, Sparkles, Award, Heart, Camera];
            const IconComponent = icons[index % icons.length];
            
            return (
              <Card key={item.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="relative">
                    <div
                      className="h-64 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <IconComponent className="h-5 w-5 text-slate-900" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white font-oswald mb-2">{item.title}</h3>
                    <p className="text-white/70 mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => {
                        const tagColors: { [key: string]: string } = {
                          'Clássico': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                          'Tradicional': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                          'Barba': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                          'Moderno': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                          'Degradê': 'bg-green-500/20 text-green-400 border-green-500/30',
                          'Combo': 'bg-red-500/20 text-red-400 border-red-500/30',
                          'Premium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                          'Coloração': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
                          'Infantil': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                          'Especializado': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        };
                        return (
                          <Badge key={tag} className={`${tagColors[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} font-medium`}>
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white rounded-full p-3">
                <Scissors className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-3xl font-bold text-white font-oswald">CAMISA 10 BARBEARIA</h3>
            </div>
            <p className="text-white/80 text-lg mb-8">
              Tradição e estilo em cada corte
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-white/70">
              <div>
                <h4 className="font-bold text-white mb-2">📍 ENDEREÇO</h4>
                <p>Rua das Tesouras, 123</p>
                <p>Centro - São Paulo/SP</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">📞 CONTATO</h4>
                <p>(11) 99999-9999</p>
                <p>contato@camisa10barbearia.com</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">🕒 FUNCIONAMENTO</h4>
                <p>Segunda à Sexta: 9h às 19h</p>
                <p>Sábado: 8h às 17h</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}