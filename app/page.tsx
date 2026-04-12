'use client'

import { useState, useRef } from 'react'

interface AnalysisResult {
  topic: string
  keywords: string[]
  summary: string
  emotion: {
    primary: string
    score: number
    breakdown: { label: string; value: number; color: string }[]
  }
}

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('Only .txt files are supported.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setText(e.target?.result as string || '')
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Something went wrong. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'baseline',
        gap: '1rem',
        background: 'var(--cream)',
      }}>
        <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          Text<span style={{ color: 'var(--rust)' }}>Lens</span>
        </h1>
        <span className="font-mono-custom" style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
          AI-POWERED TEXT ANALYSIS
        </span>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Intro */}
        <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
          <h2 className="font-display" style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Reveal what lies<br />
            <span style={{ color: 'var(--rust)', fontStyle: 'italic' }}>beneath the words.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.6 }}>
            Paste any text or upload a .txt file. TextLens will extract the core topic,
            key concepts, a concise summary, and the emotional tone.
          </p>
        </div>

        {/* Input area */}
        <div className="animate-fade-up-d1" style={{ marginBottom: '1.5rem' }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--rust)' : 'var(--border)'}`,
              borderRadius: '6px',
              background: dragOver ? 'rgba(196,68,28,0.04)' : 'var(--paper)',
              transition: 'all 0.2s ease',
              padding: '0.5rem',
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here… or drag & drop a .txt file"
              rows={10}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '1rem',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--ink)',
                resize: 'vertical',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace',
                  letterSpacing: '0.05em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--rust)'
                  e.currentTarget.style.color = 'var(--rust)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                ↑ UPLOAD .TXT
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {text && (
                <span className="font-mono-custom" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {wordCount} words
                </span>
              )}
            </div>

            <button
              onClick={analyze}
              disabled={!text.trim() || loading}
              style={{
                background: text.trim() && !loading ? 'var(--ink)' : 'var(--border)',
                color: text.trim() && !loading ? 'var(--cream)' : 'var(--muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.65rem 1.75rem',
                fontSize: '0.85rem',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em',
                cursor: text.trim() && !loading ? 'pointer' : 'default',
                transition: 'all 0.2s',
                fontWeight: 500,
              }}
            >
              {loading ? 'ANALYZING…' : 'ANALYZE →'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(196,68,28,0.08)',
            border: '1px solid rgba(196,68,28,0.3)',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--rust)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="loading-shimmer" style={{ height: '140px', borderRadius: '4px' }} />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-fade-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

              {/* Topic */}
              <div className="result-card animate-fade-up-d1">
                <div className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>TOPIC</div>
                <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>{result.topic}</div>
              </div>

              {/* Emotion */}
              <div className="result-card animate-fade-up-d2">
                <div className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>EMOTIONAL TONE</div>
                <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {result.emotion.primary}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.emotion.breakdown.map((e) => (
                    <div key={e.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{e.label}</span>
                        <span className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{e.value}%</span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: '3px', height: '5px' }}>
                        <div style={{ background: e.color, height: '5px', borderRadius: '3px', width: `${e.value}%`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="result-card animate-fade-up-d3" style={{ marginBottom: '1rem' }}>
              <div className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>KEY CONCEPTS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {result.keywords.map((kw) => (
                  <span key={kw} className="tag">{kw}</span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="result-card animate-fade-up-d4">
              <div className="font-mono-custom" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>SUMMARY</div>
              <p style={{ lineHeight: 1.75, color: 'var(--ink)', fontSize: '0.95rem' }}>{result.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', textAlign: 'center' }}>
        <span className="font-mono-custom" style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>
          TEXTLENS — POWERED BY CLAUDE AI
        </span>
      </footer>
    </main>
  )
}
