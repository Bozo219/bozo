import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImage(e.target.result.split(',')[1]);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  const biasColor = result?.bias === 'BULLISH' ? '#4ade80' : result?.bias === 'BEARISH' ? '#f87171' : '#a78bfa';
  const scoreColor = result ? (result.confluence_score >= 0.75 ? '#4ade80' : result.confluence_score >= 0.5 ? '#ffd700' : '#f87171') : '#ffd700';

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', fontFamily: 'sans-serif', color: '#e8e6ff', padding: '40px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 3, marginBottom: 8, opacity: 0.7 }}>⬡ XAUUSD · AI ANALYZER</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Bozo <span style={{ color: '#ffd700' }}>Chart</span> Analyzer</h1>
          <p style={{ fontSize: 13, color: '#6b6a8a', marginTop: 8 }}>Upload your TradingView screenshot — MA21 · MA50 · Zones · OBs · Patterns</p>
        </div>

        {/* Upload */}
        <label style={{
          display: 'block', border: '1.5px dashed rgba(255,215,0,0.25)', borderRadius: 16,
          padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
          background: 'rgba(255,215,0,0.02)', transition: 'all 0.2s'
        }}>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            {image ? '✓ Chart loaded — ready to analyze' : 'Click to upload your TradingView chart'}
          </div>
          <div style={{ fontSize: 12, color: '#6b6a8a' }}>PNG / JPG · Any timeframe · XAUUSD</div>
        </label>

        {/* Preview */}
        {preview && (
          <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,215,0,0.15)' }}>
            <img src={preview} alt="Chart" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#0f0f1a', display: 'block' }} />
          </div>
        )}

        {/* Analyze Button */}
        {image && !result && (
          <button onClick={analyze} disabled={loading} style={{
            width: '100%', marginTop: 16, padding: 16,
            background: loading ? 'rgba(255,215,0,0.3)' : '#ffd700',
            color: '#0a0a0f', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '⏳ Analyzing chart...' : '⚡ Analyze Chart'}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,60,60,0.2)', color: '#f87171', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: 24, border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Result Header */}
            <div style={{ padding: '14px 20px', background: 'rgba(255,215,0,0.06)', borderBottom: '1px solid rgba(255,215,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2 }}>● ANALYSIS COMPLETE</div>
              <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}40`, fontWeight: 700 }}>
                CONFLUENCE {parseFloat(result.confluence_score).toFixed(2)}
              </div>
            </div>

            <div style={{ padding: 20 }}>
              {/* Bias */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: `${biasColor}0a`, border: `1px solid ${biasColor}25`, marginBottom: 20 }}>
                <span style={{ fontSize: 11, color: '#6b6a8a', letterSpacing: 2 }}>OVERALL BIAS</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: biasColor }}>
                  {result.bias === 'BULLISH' ? '▲' : result.bias === 'BEARISH' ? '▼' : '◆'} {result.bias}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b6a8a' }}>TF: {result.timeframe}</span>
              </div>

              {/* Sections */}
              {[
                { title: 'MA21 & MA50', data: [result.ma_analysis] },
                { title: 'Order Blocks', data: result.order_blocks },
                { title: 'Support & Resistance', data: result.support_resistance },
                { title: 'Consolidation', data: [result.consolidation] },
                { title: 'Trend Lines', data: result.trend_lines },
                { title: 'Broken Zones', data: result.broken_zones },
                { title: 'Candlestick Patterns', data: result.candlestick_patterns },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#ffd700', letterSpacing: 3, marginBottom: 8, opacity: 0.7 }}>{s.title.toUpperCase()}</div>
                  {(Array.isArray(s.data) ? s.data : [s.data]).map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 5, background: 'rgba(255,255,255,0.02)', fontSize: 13, color: '#c8c6e8', lineHeight: 1.5 }}>
                      <span style={{ color: '#ffd700', flexShrink: 0 }}>→</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Summary */}
              <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.12)', fontSize: 13, color: '#c8c6e8', lineHeight: 1.6 }}>
                <strong style={{ color: '#ffd700' }}>📋 Summary:</strong> {result.summary}
              </div>

              {/* Reset */}
              <button onClick={reset} style={{
                width: '100%', marginTop: 16, padding: 12,
                background: 'transparent', border: '1px solid rgba(255,215,0,0.25)',
                borderRadius: 10, color: '#ffd700', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>↺ Analyze Another Chart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
