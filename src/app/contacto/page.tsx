import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle, Instagram } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black mb-4">Contactanos</h1>
            <p className="text-xl text-muted-foreground">Estamos aquí para ayudarte a elegir tu ambo ideal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">WhatsApp</h3>
                  <p className="text-muted-foreground">+54 9 11 0000-0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-2xl text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email</h3>
                  <p className="text-muted-foreground">contacto@medcel.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/20 rounded-2xl text-accent-foreground">
                  <Instagram className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instagram</h3>
                  <p className="text-muted-foreground">@medcel_ambos</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-2xl text-muted-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Ubicación</h3>
                  <p className="text-muted-foreground">Buenos Aires, Argentina (Envíos a todo el país)</p>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-xl bg-card">
              <CardContent className="pt-8 space-y-4">
                <h3 className="text-xl font-bold mb-4">Envíanos un mensaje rápido</h3>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Nombre</label>
                   <input className="w-full p-3 rounded-xl border border-border bg-background" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Consulta</label>
                   <textarea className="w-full p-3 rounded-xl border border-border bg-background h-32" placeholder="¿En qué podemos ayudarte?" />
                </div>
                <Button className="w-full rounded-xl py-6 font-bold flex gap-2">
                   <MessageCircle className="h-5 w-5" /> Enviar Consulta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
