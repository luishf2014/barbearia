import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Clock, Users, Star, MapPin, Phone } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse-slow flex items-center justify-center text-white/20 text-4xl">✂️</div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-float flex items-center justify-center text-white/30 text-2xl">💈</div>
          <div className="absolute bottom-32 left-32 w-20 h-20 bg-white/5 rounded-full animate-pulse-slow flex items-center justify-center text-white/20 text-xl">⚡</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Logo Section */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="bg-white rounded-full p-4">
                <Scissors className="h-12 w-12 text-slate-900" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-7xl font-bold text-white font-oswald tracking-wider">
                  CAMISA 10
                </h1>
                <p className="text-lg text-white/70 font-light tracking-widest -mt-2">
                  BARBEARIA
                </p>
              </div>
            </div>
            <div className="w-32 h-1 bg-white/50 mx-auto mb-8"></div>
          </div>
          
          <p className="text-xl md:text-3xl mb-12 text-white/90 font-light max-w-3xl mx-auto">
            Tradição, estilo e qualidade em cada corte
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-200 font-semibold py-4 px-8 text-lg" asChild>
              <Link href="/agenda">🚀 Agendar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-4 px-8 text-lg" asChild>
              <Link href="/galeria">📸 Ver Galeria</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-oswald">
            Por que escolher a CAMISA 10?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-700 border-slate-600 p-8 text-center hover:bg-slate-600 transition-all duration-300 group">
              <CardHeader>
                <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-12 w-12 text-slate-900" />
                </div>
                <CardTitle className="text-2xl font-semibold text-white font-oswald">Profissionais de Elite</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed">
                  Nossa equipe é formada por barbeiros experientes e apaixonados pela arte do corte masculino.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-8 text-center hover:bg-slate-600 transition-all duration-300 group">
              <CardHeader>
                <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-12 w-12 text-slate-900" />
                </div>
                <CardTitle className="text-2xl font-semibold text-white font-oswald">Agendamento Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed">
                  Agende seu horário de forma rápida e prática através do nosso sistema online
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-8 text-center hover:bg-slate-600 transition-all duration-300 group">
              <CardHeader>
                <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Star className="h-12 w-12 text-slate-900" />
                </div>
                <CardTitle className="text-2xl font-semibold text-white font-oswald">Atendimento Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed">
                  Oferecemos uma experiência única com produtos de alta qualidade
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-oswald">
              Nossos Serviços
            </h2>
            <div className="w-32 h-1 bg-white/50 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Corte Masculino', price: 'R$ 35,00', icon: '✂️' },
              { name: 'Barba', price: 'R$ 25,00', icon: '🪒' },
              { name: 'Corte + Barba', price: 'R$ 55,00', icon: '💈' },
              { name: 'Sobrancelha', price: 'R$ 15,00', icon: '✨' },
            ].map((service, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                  <CardTitle className="text-xl text-white font-oswald">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-white">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-oswald">
              Onde nos encontrar
            </h2>
            <div className="w-32 h-1 bg-white/50 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white font-oswald text-xl">
                  <div className="bg-white rounded-full p-2">
                    <MapPin className="h-6 w-6 text-slate-900" />
                  </div>
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 text-lg leading-relaxed">
                  📍 Rua das Flores, 123<br />
                  Centro - São Paulo/SP<br />
                  CEP: 01234-567
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white font-oswald text-xl">
                  <div className="bg-white rounded-full p-2">
                    <Phone className="h-6 w-6 text-slate-900" />
                  </div>
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 text-lg leading-relaxed">
                  📞 Telefone: (11) 99999-9999<br />
                  💬 WhatsApp: (11) 99999-9999<br />
                  ✉️ Email: contato@camisa10.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-oswald">
            Pronto para um novo visual?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Junte-se aos nossos clientes satisfeitos e experimente o melhor da barbearia tradicional
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-200 font-semibold py-4 px-8 text-lg" asChild>
            <Link href="/agenda">Começar Agora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
