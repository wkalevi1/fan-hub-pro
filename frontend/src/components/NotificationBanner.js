import React, { useState } from 'react';
import { Bell, X, Zap, Live } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '../hooks/use-toast';

const NotificationBanner = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email.",
        variant: "destructive"
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribed(true);
    localStorage.setItem('fanhub_notifications', 'true');
    localStorage.setItem('fanhub_email', email);
    
    toast({
      title: "¡Suscripción exitosa!",
      description: "Recibirás notificaciones de los lives y nuevo contenido.",
    });
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    setEmail('');
    localStorage.removeItem('fanhub_notifications');
    localStorage.removeItem('fanhub_email');
    
    toast({
      title: "Suscripción cancelada",
      description: "Ya no recibirás notificaciones.",
    });
  };

  React.useEffect(() => {
    const stored = localStorage.getItem('fanhub_notifications');
    const storedEmail = localStorage.getItem('fanhub_email');
    if (stored === 'true' && storedEmail) {
      setIsSubscribed(true);
      setEmail(storedEmail);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <CardContent className="relative p-6 sm:p-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                  {isSubscribed ? (
                    <Zap className="h-8 w-8 text-white animate-pulse" />
                  ) : (
                    <Bell className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isSubscribed ? '🔔 ¡Estás conectada!' : '🔔 No te pierdas nada'}
                </h3>
                <p className="text-white/90 text-sm sm:text-base">
                  {isSubscribed 
                    ? 'Recibirás notificaciones de nuevos lives, posts exclusivos y contenido premium.'
                    : 'Recibe notificaciones cuando Stephanie esté en vivo o publique nuevo contenido exclusivo.'
                  }
                </p>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                {!isSubscribed ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-2 rounded-lg border-0 bg-white/90 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white w-full sm:w-auto"
                    />
                    <Button
                      onClick={handleSubscribe}
                      className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-6 py-2 w-full sm:w-auto"
                    >
                      <Live className="h-4 w-4 mr-2" />
                      Suscribirme
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="text-white/90 text-sm bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                      {email}
                    </div>
                    <Button
                      onClick={handleUnsubscribe}
                      variant="outline"
                      className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Live indicator simulation */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-center sm:justify-start text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span>Próximo live: Hoy 8:00 PM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NotificationBanner;