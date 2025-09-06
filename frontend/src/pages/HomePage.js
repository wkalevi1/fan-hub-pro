// fan-hub-pro/frontend/src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import OutfitRanking from '../components/OutfitRanking';
import QASection from '../components/QASection';
import WallpaperGallery from '../components/WallpaperGallery';
import NotificationBanner from '../components/NotificationBanner';
import SocialLinks from '../components/SocialLinks';
import Footer from '../components/Footer';
import { api, API_BASE_URL } from '../lib/api';

export default function HomePage() {
  const [msg, setMsg] = useState('Comprobando API… (' + API_BASE_URL + ')');

  useEffect(() => {
    api.get('/health')
      .then(r => setMsg('API ok: ' + JSON.stringify(r.data)))
      .catch(e => setMsg('API error: ' + (e?.message || String(e))));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40">
      {/* Barra simple para evitar pantalla en blanco y ver el estado del API */}
      <div style={{ padding: '8px 12px', fontSize: 12, color: '#fff', background: '#16a34a' }}>
        {msg}
      </div>

      <Header />
      <HeroSection />
      <OutfitRanking />
      <QASection />
      <WallpaperGallery />
      <NotificationBanner />
      <SocialLinks />
      <Footer />
    </div>
  );
}

