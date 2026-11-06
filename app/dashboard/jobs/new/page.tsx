'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase, JOB_TYPES } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customer_name: '',
    job_type: JOB_TYPES[0],
    location: '',
    description: '',
    priority: 'medium',
    total_visits: '',
    amount: '',
    phone: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { error } = await supabase.from('jobs').insert({
      user_id: session.user.id,
      customer_name: form.customer_name,
      job_type: form.job_type,
      location: form.location,
      description: form.description,
      status: 'enquiry',
      priority: form.priority,
      visit_count: 0,
      total_visits: form.total_visits ? parseInt(form.total_visits) : null,
      amount: form.amount ? parseFloat(form.amount) : null,
      phone: form.phone || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid var(--border-mid)',
    borderRadius: '8px', fontSize: '.95rem', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
    fontFamily: 'inherit',
  }
  const labelStyle = { display: 'block' as const, fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <Link href="/dashboard" style={{ color: 'var(--fg-soft)', textDecoration: 'none', fontSize: '.9rem' }}>← All Jobs</Link>
        <span style={{ color: 'var(--border-mid)' }}>/</span>
        <span style={{ fontSize: '.9rem', color: 'var(--fg-mid)' }}>New Job</span>
      </div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '24px' }}>Add new job</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Customer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Customer name *</label>
            <input
              type="text" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required
              placeholder="Seán Murphy" style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input
              type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="087 123 4567" style={inputStyle}
            />
          </div>
        </div>

        {/* Job type + location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Job type *</label>
            <select value={form.job_type} onChange={e => set('job_type', e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Location *</label>
            <input
              type="text" value={form.location} onChange={e => set('location', e.target.value)} required
              placeholder="Blackrock, Dublin" style={inputStyle}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Details about the job — scope, access notes, any existing issues…"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Priority + visits + amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>No. of visits</label>
            <input
              type="number" min="1" value={form.total_visits} onChange={e => set('total_visits', e.target.value)}
              placeholder="e.g. 3" style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Quoted amount (€)</label>
            <input
              type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="e.g. 1200" style={inputStyle}
            />
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '.85rem', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button
            type="submit" disabled={loading}
            style={{ padding: '13px 28px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving…' : 'Add job'}
          </button>
          <Link href="/dashboard" style={{ padding: '13px 24px', border: '1px solid var(--border-mid)', borderRadius: '100px', textDecoration: 'none', color: 'var(--fg-mid)', fontWeight: 600, fontSize: '.95rem' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
