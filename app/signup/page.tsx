'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--green)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--fg)' }}>Láimhe</span>
        </Link>

        <div style={{ background: '#fff', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: 'var(--fg-soft)', fontSize: '.9rem', marginBottom: '24px' }}>30 days free — no card required</p>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Your name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Pádraig Murphy"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.ie"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: '.85rem', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>}
            <button
              type="submit" disabled={loading}
              style={{ padding: '13px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '.875rem', color: 'var(--fg-soft)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
