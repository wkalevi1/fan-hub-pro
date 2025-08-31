import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import OutfitRanking from '../components/OutfitRanking';
import QASection from '../components/QASection';
import WallpaperGallery from '../components/WallpaperGallery';
import NotificationBanner from '../components/NotificationBanner';
import SocialLinks from '../components/SocialLinks';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40">
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
};

export default HomePage;