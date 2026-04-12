'use client'

import { useState } from 'react'

interface RecipeResult {
  recipeName: string
  time: string
  steps: string[]
  missingStaples: string[]
}

export default function Home() {
  const [ingredients, setIngredients] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecipeResult | null>(null)
  const [error, setError] = useState('')

  const cook = async () => {
    if (!ingredients.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      if (!res.ok) throw new Error('Cooking failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('The kitchen caught on fire. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '4rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#2d3748' }}>
          👨‍🍳 Fridge Chef
        </h1>
        <p style={{ color: '#718096', fontSize: '1.1rem' }}>
          Tell me what's in your messy fridge. I'll tell you what's for dinner.
        </p>
      </div>

      {/* Input Section */}
      <div style={{ marginBottom: '2rem' }}>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g., half an onion, two eggs, some old spinach, a weird block of cheese..."
          rows={4}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            resize: 'vertical',
            marginBottom: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={cook}
          disabled={!ingredients.trim() || loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: ingredients.trim() && !loading ? '#48bb78' : '#e2e8f0',
            color: ingredients.trim() && !loading ? 'white' : '#a0aec0',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: ingredients.trim() && !loading ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '🍳 Inventing Recipe...' : 'Let\'s Cook'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem', background: '#fff5f5', color: '#c53030', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div style={{ background: '#f7fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#2d3748' }}>{result.recipeName}</h2>
            <span style={{ background: '#edf2f7', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>
              ⏱️ {result.time}
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', color: '#4a5568', marginBottom: '1rem' }}>Instructions:</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#2d3748', lineHeight: 1.7 }}>
            {result.steps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
            ))}
          </ul>

          {result.missingStaples.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                💡 <strong>Chef's Tip:</strong> This would be even better if you had: {result.missingStaples.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
