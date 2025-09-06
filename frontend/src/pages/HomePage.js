// frontend/src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../lib/api";

import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import OutfitRanking from "../components/OutfitRanking";
import QASection from "../components/QASection";
import WallpaperGallery from "../components/WallpaperGallery";
import NotificationBanner from "../components/NotificationBanner";
import SocialLinks from "../components/SocialLinks";
import Footer from "../components/Footer";

const SHOW_DEBUG = false; // ← pon en true si querés ver la barra

export default function HomePage() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/health")
      .then(r => setMsg("API ok: " + JSON.stringify(r.data)))
      .catch(e => setMsg("API error: " + (e?.message || String(e))));
  }, []);

  const ok = msg.startsWith("API ok");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40">
      {SHOW_DEBUG && (
        <div style={{
          background: ok ? "#16a34a" : "#b00020",
          color:"#fff", padding:"6px 10px", fontSize:12, marginBottom:12
        }}>
          {msg} <span style={{opacity:.6}}>({API_BASE_URL})</span>
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

