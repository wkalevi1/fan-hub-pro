import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../lib/api";

export default function HomePage() {
  const [msg, setMsg] = useState("Comprobando API… (" + API_BASE_URL + ")");

  useEffect(() => {
    api.get("/health")
      .then(r => setMsg("API ok: " + JSON.stringify(r.data)))
      .catch(e => setMsg("API error: " + (e?.message || String(e))));
  }, []);

  const ok = msg.startsWith("API ok");
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{
        background: ok ? "#16a34a" : "#b00020",
        color: "#fff", padding: "6px 10px", fontSize: 12, marginBottom: 12
      }}>
        {msg}
      </div>

      {/* Reactiva uno por uno:
      <Header />
      <HeroSection />
      <OutfitRanking />
      <QASection />
      <WallpaperGallery />
      <NotificationBanner />
      <SocialLinks />
      <Footer />
      */}
      <p>HomePage mínima ✅</p>
    </div>
  );
}
