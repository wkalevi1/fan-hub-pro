// fan-hub-pro/frontend/src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { api, API_BASE_URL } from '../lib/api';

export default function HomePage() {
  const [msg, setMsg] = useState('Comprobando API… (' + API_BASE_URL + ')');

  useEffect(() => {
    api.get('/health')
      .then(r => setMsg('API ok: ' + JSON.stringify(r.data)))
      .catch(e => setMsg('API error: ' + (e?.message || String(e))));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>StephanieG Fans — Online</h1>
      <p>{

