'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, JOB_TYPES, Job } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    supabase.from('jobs').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          customer_name: data.customer_name ?? '',
          job_type: data.job_type ?? JOB_TYPES[0],
          location: data.location ?? '',
          description: data.description ?? '',
          priority: data.priority ?? 'medium',
          total_visits: data.total_visits?.toString() ?? '',
          amount: data.amount?.toString() ?? '',
          phone: data.phone ?? '',
        })
      }
      setLoading(false)
    })
  }, [id])

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('jobs').update({
      customer_name: form.customer_name,
      job_type: form.job_type,
      location: form.location,
      description: form.description,
      priority: form.priority,
      total_visits: form.total_visits ? parseInt(form.total_visits) : null,
      amount: form.amount ? parseFloat(form.amount) : null,
      phone: form.phone || null,
    }).eq('id', id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push(`/dashboard/jobs/${id}`)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid var(--border-mid)',
    borderRadius: '8px', fontSize: '.95rem', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff', fontFamily: 'inherit',
  }
  const labelStyle = { display: 'block' as const, fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }

  if (loading) return <div style={{ padding: '32px', color: 'var(--fg-soft)' }}>Loading…</div>

  return (
    <div style={{ padding: '32px', maxWidth: '640px', marginRight: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <Link href={`/dashboard/jobs/${id}`} style={{ color: 'var(--fg-soft)', textDecoration: 'none', fontSize: '.9rem' }}>← Back to job</Link>
        <span style={{ color: 'var(--border-mid)' }}>/</span>
        <span style={{ fontSize: '.9rem', color: 'var(--fg-mid)' }}>Edit</span>
      </div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '24px' }}>Edit job</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Customer name *</label>
            <input type="text" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="087 123 4567" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Job type *</label>
            <select value={form.job_type} onChange={e => set('job_type', e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Location *</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} required style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

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
            <input type="number" min="1" value={form.total_visits} onChange={e => set('total_visits', e.target.value)} placeholder="e.g. 3" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Quoted amount (€)</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 1200" style={inputStyle} />
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '.85rem', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type="submit" disabled={saving} style={{ padding: '13px 28px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.95rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <Link href={`/dashboard/jobs/${id}`} style={{ padding: '13px 24px', border: '1px solid var(--border-mid)', borderRadius: '100px', textDecoration: 'none', color: 'var(--fg-mid)', fontWeight: 600, fontSize: '.95rem' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
