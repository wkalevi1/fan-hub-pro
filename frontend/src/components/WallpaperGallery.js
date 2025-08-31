import React, { useState, useEffect } from 'react';
import { Download, Image, Filter, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { wallpapersAPI, sessionAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import useScrollAnimation from '../hooks/useScrollAnimation';
import Loader from './Loader';

const WallpaperGallery = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadedItems, setDownloadedItems] = useState({});
  const { toast } = useToast();
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    fetchWallpapers();
    setDownloadedItems(sessionAPI.getStoredDownloads());
  }, []);

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      const response = await wallpapersAPI.getAll();
      if (response.data.success) {
        setWallpapers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los wallpapers.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = ['all', 'lifestyle', 'fitness', 'fashion', 'aesthetic'];

  const filteredWallpapers = selectedCategory === 'all' 
    ? wallpapers 
    : wallpapers.filter(w => w.category === selectedCategory);

  const handleDownload = async (wallpaper) => {
    try {
      // Track download in backend
      const response = await wallpapersAPI.download(wallpaper.id);
      
      if (response.data.success) {
        setDownloadedItems(prev => ({ ...prev, [wallpaper.id]: true }));
        sessionAPI.storeDownload(wallpaper.id);
        
        // Create download link
        const a = document.createElement('a');
        a.href = response.data.data.downloadUrl;
        a.download = `${wallpaper.title.replace(/\s+/g, '_')}_StephanieG.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast({
          title: "¡Descarga iniciada!",
          description: `${wallpaper.title} se está descargando.`,
        });

        // Update local wallpaper downloads count
        setWallpapers(prev =>
          prev.map(w =>
            w.id === wallpaper.id ? { ...w, downloads: response.data.data.downloads } : w
          )
        );
      }
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el wallpaper.",
        variant: "destructive"
      });
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      all: 'Todos',
      lifestyle: 'Lifestyle',
      fitness: 'Fitness',
      fashion: 'Fashion',
      aesthetic: 'Aesthetic'
    };
    return labels[category] || category;
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            🖼 Wallpapers Exclusivos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descarga wallpapers premium de Stephanie para tu móvil y desktop
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                : "border-amber-300 text-amber-700 hover:bg-amber-50"
              }
            >
              <Filter className="h-3 w-3 mr-1" />
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWallpapers.map(wallpaper => (
            <Card 
              key={wallpaper.id}
              className="group overflow-hidden bg-white/70 backdrop-blur-sm border-amber-200/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[9/16] overflow-hidden">
                <img 
                  src={wallpaper.image}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Watermark */}
                <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  Stephanie G Official
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-3 text-white w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm">
                        <Eye className="h-3 w-3" />
                        <span>{wallpaper.downloads}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(wallpaper)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {wallpaper.title}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className="text-xs text-amber-600 border-amber-300 capitalize"
                  >
                    {wallpaper.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {wallpaper.downloads} descargas
                  </span>
                  
                  <Button
                    size="sm"
                    onClick={() => handleDownload(wallpaper)}
                    disabled={downloadedItems[wallpaper.id]}
                    className={`text-xs ${
                      downloadedItems[wallpaper.id]
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    } text-white`}
                  >
                    {downloadedItems[wallpaper.id] ? '✓ Descargado' : 'Descargar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWallpapers.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay wallpapers en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WallpaperGallery;