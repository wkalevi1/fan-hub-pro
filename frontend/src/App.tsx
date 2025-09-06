import { useEffect, useState } from 'react';
import { api, API_BASE_URL } from './lib/api';

export default function App() {
  const [msg, setMsg] = useState('Cargando… (' + API_BASE_URL + ')');
  useEffect(() => {
    api.get('/health')
      .then(r => setMsg('API ok: ' + JSON.stringify(r.data)))
      .catch(e => setMsg('API error: ' + (e?.message || String(e))));
  }, []);
  return <div style={{padding:16}}>{msg}</div>;
}

