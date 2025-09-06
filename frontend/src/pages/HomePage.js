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
  const [apiMsg, setApiMsg] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then(r => setApiMsg(`API ok: ${JSON.stringify(r.data)}`))
      .catch(e => setApiMsg(`API error: ${e?.message || String(e)}`));
  }, []);

  const ok = apiMsg?.startsWith('API ok');
  const barClass =
    'w-full text-xs text-white px-3 py-2 ' + (ok ? 'bg-emerald-600/90' : 'bg-red-600/90');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40">
      {apiMsg && (
        <div className={barClass}>
          {apiMsg} <span className="opacity-70">({API_BASE_URL})</span>
        </div>
      )}

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


