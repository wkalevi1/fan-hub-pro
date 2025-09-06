import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../lib/api";

// 👇 Importa tus secciones
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import OutfitRanking from "../components/OutfitRanking";
import QASection from "../components/QASection";
import WallpaperGallery from "../components/WallpaperGallery";
import NotificationBanner from "../components/NotificationBanner";
import SocialLinks from "../components/SocialLinks";
import Footer from "../components/Footer";

// Error boundary por-componente (si uno falla, no tumba la página)
class Guard extends React.Component {
  constructor(p){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  componentDidCatch(err, info){ console.error(`[${this.props.name}]`, err, info); }
  render(){
    if (this.state.err) {
      return (
        <div style={{background:"#b00020",color:"#fff",padding:8,margin:"8px 0",fontSize:12}}>
          {this.props.name} falló: {String(this.state.err.message || this.state.err)}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HomePage() {
  const [msg, setMsg] = useState("Comprobando API… (" + API_BASE_URL + ")");

  useEffect(() => {
    api.get("/health")
      .then(r => setMsg("API ok: " + JSON.stringify(r.data)))
      .catch(e => setMsg("API error: " + (e?.message || String(e))));
  }, []);

  const ok = msg.startsWith("API ok");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40" style={{fontFamily:"system-ui"}}>
      {/* Barra de estado API */}
      <div style={{
        background: ok ? "#16a34a" : "#b00020",
        color:"#fff", padding:"6px 10px", fontSize:12, marginBottom:12
      }}>
        {msg}
      </div>

      {/* Activa todo envuelto en Guard: si uno rompe, lo verás en rojo */}
      <Guard name="Header"><Header /></Guard>
      <Guard name="HeroSection"><HeroSection /></Guard>
      <Guard name="OutfitRanking"><OutfitRanking /></Guard>
      <Guard name="QASection"><QASection /></Guard>
      <Guard name="WallpaperGallery"><WallpaperGallery /></Guard>
      <Guard name="NotificationBanner"><NotificationBanner /></Guard>
      <Guard name="SocialLinks"><SocialLinks /></Guard>
      <Guard name="Footer"><Footer /></Guard>
    </div>
  );
}
