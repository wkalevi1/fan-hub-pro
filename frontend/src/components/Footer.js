import React from 'react';
import { Heart, Crown, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Fan Hub Pro
                </h3>
                <p className="text-xs text-gray-400">StephanieG.co</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              La experiencia exclusiva para fans de Stephanie G. 
              Contenido premium, interacción directa y una comunidad increíble.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center">
              <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#outfits" className="hover:text-amber-400 transition-colors duration-200">
                  Ranking de Outfits
                </a>
              </li>
              <li>
                <a href="#qa" className="hover:text-amber-400 transition-colors duration-200">
                  Pregúntame Algo
                </a>
              </li>
              <li>
                <a href="#wallpapers" className="hover:text-amber-400 transition-colors duration-200">
                  Wallpapers Exclusivos
                </a>
              </li>
              <li>
                <a href="#notifications" className="hover:text-amber-400 transition-colors duration-200">
                  Notificaciones Live
                </a>
              </li>
            </ul>
          </div>

          {/* Community Stats */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center md:justify-end">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              Comunidad
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>2.1M+ Seguidores en Instagram</p>
              <p>3.2M+ Fans en TikTok</p>
              <p>890K+ Suscriptores YouTube</p>
              <p>Comunidad activa 24/7</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 Fan Hub Pro - StephanieG.co. Todos los derechos reservados.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-amber-400 transition-colors duration-200">
                Privacidad
              </a>
              <a href="#terms" className="hover:text-amber-400 transition-colors duration-200">
                Términos
              </a>
              <a href="#contact" className="hover:text-amber-400 transition-colors duration-200">
                Contacto
              </a>
            </div>
          </div>
          
          <div className="text-center mt-4 text-xs text-gray-500">
            Hecho con <Heart className="h-3 w-3 inline text-red-400" /> para la mejor comunidad de fans
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;