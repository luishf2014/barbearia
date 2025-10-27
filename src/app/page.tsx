import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Clock, Users, Star, MapPin, Phone } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-16 h-16 md:w-32 md:h-32 bg-white/5 rounded-full animate-pulse-slow flex items-center justify-center text-white/20 text-xl md:text-4xl">✂️</div>
          <div className="absolute top-20 md:top-40 right-4 md:right-20 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full animate-float flex items-center justify-center text-white/30 text-lg md:text-2xl">💈</div>
          <div className="absolute bottom-16 md:bottom-32 left-8 md:left-32 w-10 h-10 md:w-20 md:h-20 bg-white/5 rounded-full animate-pulse-slow flex items-center justify-center text-white/20 text-sm md:text-xl">⚡</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 text-center">
          {/* Logo Section */}
          <div className="mb-6 md:mb-8">
            <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="bg-white rounded-full p-3 md:p-4">
                <Scissors className="h-8 w-8 md:h-12 md:w-12 text-slate-900" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white font-oswald tracking-wider">
                  CAMISA 10
                </h1>
                <p className="text-sm md:text-lg text-white/70 font-light tracking-widest -mt-1 md:-mt-2">
                  BARBEARIA
                </p>
              </div>
            </div>
            <div className="w-24 md:w-32 h-1 bg-white/50 mx-auto mb-6 md:mb-8"></div>
          </div>
          
          <p className="text-lg sm:text-xl md:text-3xl mb-8 md:mb-12 text-white/90 font-light max-w-3xl mx-auto px-4">
            Tradição, estilo e qualidade em cada corte
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-200 font-semibold py-3 md:py-4 px-6 md:px-8 text-base md:text-lg w-full sm:w-auto" asChild>
              <Link href="/agenda">🚀 Agendar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-3 md:py-4 px-6 md:px-8 text-base md:text-lg w-full sm:w-auto" asChild>
              <Link href="/galeria">📸 Ver Galeria</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-white font-oswald px-4">
            Por que escolher a CAMISA 10?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="bg-slate-700 border-slate-600 p-6 md:p-8 text-center hover:bg-slate-600 transition-all duration-300 group">
              <CardHeader>
                <div className="bg-white rounded-full p-3 md:p-4 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-slate-900" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-white font-oswald">Profissionais de Elite</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed text-sm md:text-base">
                  Nossa equipe é formada por barbeiros experientes e apaixonados pela arte do corte masculino.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-6 md:p-8 text-center hover:bg-slate-600 transition-all duration-300 group">
              <CardHeader>
                <div className="bg-white rounded-full p-3 md:p-4 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-10 w-10 md:h-12 md:w-12 text-slate-900" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-white font-oswald">Agendamento Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed text-sm md:text-base">
                  Agende seu horário de forma rápida e prática através do nosso sistema online
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-6 md:p-8 text-center hover:bg-slate-600 transition-all duration-300 group md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="bg-white rounded-full p-3 md:p-4 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Star className="h-10 w-10 md:h-12 md:w-12 text-slate-900" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-white font-oswald">Atendimento Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 leading-relaxed text-sm md:text-base">
                  Oferecemos uma experiência única com produtos de alta qualidade
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 font-oswald px-4">
              Nossos Serviços
            </h2>
            <div className="w-24 md:w-32 h-1 bg-white/50 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { name: 'Corte Masculino', price: 'R$ 35,00', icon: '✂️' },
              { name: 'Barba', price: 'R$ 25,00', icon: '🪒' },
              { name: 'Corte + Barba', price: 'R$ 55,00', icon: '💈' },
              { name: 'Sobrancelha', price: 'R$ 15,00', icon: '✨' },
            ].map((service, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-300 group">
                <CardHeader className="text-center p-4 md:p-6">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                  <CardTitle className="text-lg md:text-xl text-white font-oswald">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 md:p-6 pt-0">
                  <p className="text-2xl md:text-3xl font-bold text-white">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 font-oswald px-4">
              Onde nos encontrar
            </h2>
            <div className="w-24 md:w-32 h-1 bg-white/50 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-all duration-300">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-white font-oswald text-lg md:text-xl">
                  <div className="bg-white rounded-full p-2">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
                  </div>
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-white/70 text-sm md:text-lg leading-relaxed">
                  📍 Rua das Flores, 123<br />
                  Centro - São Paulo/SP<br />
                  CEP: 01234-567
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-all duration-300">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-white font-oswald text-lg md:text-xl">
                  <div className="bg-white rounded-full p-2">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
                  </div>
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-white/70 text-sm md:text-lg leading-relaxed">
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
      <section className="py-12 md:py-20 bg-gradient-to-r from-slate-900 to-black">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 font-oswald px-4">
            Pronto para um novo visual?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Junte-se aos nossos clientes satisfeitos e experimente o melhor da barbearia tradicional
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-200 font-semibold py-3 md:py-4 px-6 md:px-8 text-base md:text-lg w-full sm:w-auto" asChild>
            <Link href="/agenda">Começar Agora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
