'use client'
import { useEffect, useState } from 'react'
import { supabase, Job } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InvoicesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id)
      .in('status', ['awaiting_invoice', 'paid'])
      .order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }

  async function markPaid(job: Job) {
    setMarking(job.id)
    await supabase.from('jobs').update({ status: 'paid' }).eq('id', job.id)
    setJobs(j => j.map(x => x.id === job.id ? { ...x, status: 'paid' } : x))
    setMarking(null)
  }

  const awaiting = jobs.filter(j => j.status === 'awaiting_invoice')
  const paid = jobs.filter(j => j.status === 'paid')
  const totalOutstanding = awaiting.reduce((sum, j) => sum + (j.amount ?? 0), 0)
  const totalPaid = paid.reduce((sum, j) => sum + (j.amount ?? 0), 0)

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '8px' }}>Invoices</h1>
      <p style={{ color: 'var(--fg-soft)', fontSize: '.9rem', marginBottom: '28px' }}>Track what you're owed and what's been paid</p>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '32px', maxWidth: '500px' }}>
        <div style={{ background: 'var(--amber-light)', border: '1px solid rgba(201,121,42,.2)', borderRadius: '12px', padding: '18px 20px' }}>
          <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>Outstanding</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>€{totalOutstanding.toLocaleString()}</p>
          <p style={{ fontSize: '.8rem', color: 'var(--amber)', marginTop: '4px', opacity: 0.75 }}>{awaiting.length} job{awaiting.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ background: 'var(--green-light)', border: '1px solid rgba(26,107,71,.2)', borderRadius: '12px', padding: '18px 20px' }}>
          <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '6px' }}>Paid</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>€{totalPaid.toLocaleString()}</p>
          <p style={{ fontSize: '.8rem', color: 'var(--green)', marginTop: '4px', opacity: 0.75 }}>{paid.length} job{paid.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Awaiting invoice */}
      {!loading && awaiting.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--amber)' }}>Awaiting invoice</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {awaiting.map(job => (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid rgba(201,121,42,.2)', borderRadius: '10px', padding: '14px 18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: '3px' }}>{job.customer_name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--fg-mid)' }}>{job.job_type} · {job.location}</div>
                </div>
                {job.amount && <span style={{ fontWeight: 700, color: 'var(--amber)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>€{job.amount.toLocaleString()}</span>}
                <button
                  onClick={() => markPaid(job)}
                  disabled={marking === job.id}
                  style={{ padding: '8px 18px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', opacity: marking === job.id ? 0.7 : 1 }}
                >
                  {marking === job.id ? '…' : 'Mark paid'}
                </button>
                <Link href={`/dashboard/jobs/${job.id}`} style={{ color: 'var(--fg-soft)', fontSize: '.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>View →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid */}
      {!loading && paid.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--green)' }}>Paid</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paid.map(job => (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', opacity: 0.75 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: '3px' }}>{job.customer_name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--fg-mid)' }}>{job.job_type} · {job.location}</div>
                </div>
                {job.amount && <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>€{job.amount.toLocaleString()}</span>}
                <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '.76rem', fontWeight: 700, background: 'var(--green-light)', color: 'var(--green)', whiteSpace: 'nowrap' }}>Paid ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-soft)' }}>
          <p>No invoices yet. Mark a job complete to see it here.</p>
          <Link href="/dashboard" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '12px' }}>Go to jobs →</Link>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-soft)' }}>Loading…</div>}
    </div>
  )
}
