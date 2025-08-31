import React from 'react';
import { Sparkles, Heart, Users } from 'lucide-react';
import { Button } from './ui/button';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/30" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/50">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Experiencia Exclusiva</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Bienvenidos al
            <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Fan Hub de Stephanie
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tu espacio exclusivo para interactuar, votar por tus outfits favoritos, 
            hacer preguntas y acceder a contenido premium.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="h-5 w-5 mr-2" />
              Comenzar Ahora
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              <Users className="h-5 w-5 mr-2" />
              Ver Comunidad
            </Button>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>2.1M Seguidores</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Active Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Premium Content</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;