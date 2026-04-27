import { useState } from 'react';
import EvaluationForm from './components/EvaluationForm.jsx';
import EvaluationResult from './components/EvaluationResult.jsx';
import './App.css';

// I udvikling er API_BASE tom → Vite-proxy håndterer /api
// I produktion sættes VITE_API_URL til Render-backend-URL
const API_BASE = import.meta.env.VITE_API_URL ?? '';

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleEvaluate({ text, file }) {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch(`${API_BASE}/api/evaluations/file`, {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch(`${API_BASE}/api/evaluations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        setError(data?.error || `Serverfejl (HTTP ${response.status}). Er backenden startet og opdateret?`);
      } else if (!data) {
        setError('Uventet svar fra serveren (ikke JSON).');
      } else {
        setResult(data);
      }
    } catch {
      setError('Kunne ikke oprette forbindelse til serveren. Er backenden startet?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-badge">Erhvervsakademi København</span>
          <h1>AI Praktikrapportvurdering</h1>
          <p className="app-subtitle">
            Vejledende AI-baseret feedback på praktikrapporter — ikke en endelig bedømmelse
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="card">
          <EvaluationForm onEvaluate={handleEvaluate} loading={loading} />
        </div>

        {error && (
          <div className="error-box">
            <strong>Fejl:</strong> {error}
          </div>
        )}

        {result && <EvaluationResult result={result} />}
      </main>
    </div>
  );
}

export default App;
