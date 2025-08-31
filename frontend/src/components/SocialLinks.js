import React from 'react';
import { ExternalLink, Share2, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { socialLinks } from './mockData';
import { useToast } from '../hooks/use-toast';

const SocialLinks = () => {
  const { toast } = useToast();

  const socialPlatforms = [
    {
      name: 'Instagram',
      url: socialLinks.instagram,
      icon: '📸',
      color: 'from-pink-500 to-rose-500',
      followers: '2.1M'
    },
    {
      name: 'YouTube',
      url: socialLinks.youtube,
      icon: '📺',
      color: 'from-red-500 to-red-600',
      followers: '890K'
    },
    {
      name: 'TikTok',
      url: socialLinks.tiktok,
      icon: '🎵',
      color: 'from-slate-900 to-slate-800',
      followers: '3.2M'
    },
    {
      name: 'X (Twitter)',
      url: socialLinks.twitter,
      icon: '🐦',
      color: 'from-blue-400 to-blue-500',
      followers: '156K'
    },
    {
      name: 'OnlyFans',
      url: socialLinks.onlyfans,
      icon: '💎',
      color: 'from-blue-600 to-blue-700',
      followers: 'Premium'
    }
  ];

  const handleSocialClick = (platform, url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: `Abriendo ${platform}`,
      description: `Te redirigimos al perfil de Stephanie en ${platform}.`,
    });
  };

  const shareApp = async () => {
    const shareData = {
      title: 'Fan Hub Pro - StephanieG.co',
      text: '¡Únete al Fan Hub de Stephanie G! Vota outfits, haz preguntas y descarga wallpapers exclusivos.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "¡Compartido!",
          description: "Gracias por compartir el Fan Hub.",
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "¡Link copiado!",
        description: "El enlace se copió al portapapeles.",
      });
    }
  };

  const copyAppLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "¡Link copiado!",
      description: "El enlace del Fan Hub se copió al portapapeles.",
    });
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            🔗 Sígueme en Redes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente conectada con todo mi contenido y no te pierdas las novedades
          </p>
        </div>

        {/* Social Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {socialPlatforms.map(platform => (
            <Card 
              key={platform.name}
              className="group overflow-hidden bg-white/70 backdrop-blur-sm border-amber-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleSocialClick(platform.name, platform.url)}
            >
              <CardContent className="p-6">
                <div className={`w-full h-32 bg-gradient-to-r ${platform.color} rounded-lg mb-4 flex items-center justify-center text-4xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="relative z-10 filter drop-shadow-lg">
                    {platform.icon}
                  </span>
                  <div className="absolute top-2 right-2">
                    <ExternalLink className="h-4 w-4 text-white/70" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {platform.followers} {platform.name === 'OnlyFans' ? 'Content' : 'seguidores'}
                  </p>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${platform.color} text-white hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSocialClick(platform.name, platform.url);
                    }}
                  >
                    Seguir en {platform.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Share Section */}
        <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200/50">
          <CardContent className="p-8 text-center">
            <Share2 className="h-8 w-8 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Comparte el Fan Hub
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              ¡Comparte este Fan Hub con otras fans de Stephanie y únanse a la comunidad!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                onClick={shareApp}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir App
              </Button>
              
              <Button
                variant="outline"
                onClick={copyAppLink}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 px-6"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </div>

            {/* Quick share buttons */}
            <div className="flex justify-center space-x-3 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=¡Mira el Fan Hub de Stephanie G! ${window.location.href}`, '_blank')}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://www.instagram.com/stories/camera/`, '_blank')}
                className="text-pink-600 border-pink-300 hover:bg-pink-50"
              >
                IG Stories
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=¡Mira el Fan Hub de Stephanie G!&url=${window.location.href}`, '_blank')}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Twitter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SocialLinks;