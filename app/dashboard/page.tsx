'use client'
export const dynamic = 'force-dynamic'
export const instant = false
import { useEffect, useState } from 'react'
import { supabase, Job, STATUS_LABELS, STATUS_COLOURS } from '@/lib/supabase'
import Link from 'next/link'

const PRIORITY_DOT: Record<string, string> = {
  high: '#E53935',
  medium: '#1A6B47',
  low: '#8A8880',
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const name = session.user.user_metadata?.full_name
    if (name) setUserName(name.split(' ')[0])

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)
  const awaitingCount = jobs.filter(j => j.status === 'awaiting_invoice').length
  const activeJobs = jobs.filter(j => j.status !== 'paid')
  const inProgress = jobs.filter(j => j.status === 'in_progress')
  const totalOutstanding = jobs.filter(j => j.status === 'awaiting_invoice').reduce((s, j) => s + (j.amount ?? 0), 0)
  const recentJobs = jobs.slice(0, 5)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'enquiry', label: 'Enquiries' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'awaiting_invoice', label: `Awaiting Invoice${awaitingCount > 0 ? ` (${awaitingCount})` : ''}` },
    { key: 'paid', label: 'Paid' },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '900px', marginRight: 'auto' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '4px' }}>
          {userName ? `Welcome back, ${userName} 👋` : 'Dashboard'}
        </h1>
        <p style={{ color: 'var(--fg-soft)', fontSize: '.9rem' }}>
          {activeJobs.length > 0
            ? `You have ${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}${awaitingCount > 0 ? ` — ${awaitingCount} waiting to be invoiced` : ''}.`
            : 'No active jobs. Add one to get started.'}
        </p>
      </div>

      {/* Stats tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Active jobs', value: activeJobs.length, color: 'var(--fg)', bg: '#fff' },
          { label: 'In progress', value: inProgress.length, color: 'var(--green)', bg: 'var(--green-light)' },
          { label: 'Awaiting invoice', value: awaitingCount, color: 'var(--amber)', bg: 'var(--amber-light)' },
          { label: 'Outstanding', value: `€${totalOutstanding.toLocaleString()}`, color: 'var(--amber)', bg: 'var(--amber-light)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--fg-soft)', marginBottom: '6px' }}>{stat.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alert if jobs awaiting invoice */}
      {awaitingCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--amber-light)', border: '1px solid rgba(201,121,42,.22)',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '20px',
          fontSize: '.9rem', fontWeight: 600, color: 'var(--amber)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {awaitingCount} completed job{awaitingCount > 1 ? 's' : ''} waiting to be invoiced
          <Link href="/dashboard/invoices" style={{ marginLeft: 'auto', color: 'var(--amber)', fontSize: '.85rem' }}>View invoices →</Link>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Jobs</h2>
        <Link href="/dashboard/jobs/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '9px 18px', background: 'var(--green)', color: '#fff',
          borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '.85rem'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Job
        </Link>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', justifyContent: 'flex-start' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '6px 16px', borderRadius: '100px', fontSize: '.82rem', fontWeight: 600,
            border: '1px solid var(--border-mid)', cursor: 'pointer',
            background: filter === f.key ? 'var(--green)' : 'transparent',
            color: filter === f.key ? '#fff' : 'var(--fg-mid)',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-soft)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-soft)' }}>
          <p style={{ marginBottom: '16px' }}>{filter === 'all' ? 'No jobs yet.' : 'No jobs with this status.'}</p>
          {filter === 'all' && (
            <Link href="/dashboard/jobs/new" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Add your first job →</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(job => (
            <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '10px 1fr auto auto',
                gap: '14px', alignItems: 'center',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '14px 18px',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIORITY_DOT[job.priority] }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: '4px' }}>{job.customer_name}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--green-light)', color: 'var(--green)' }}>{job.job_type}</span>
                    <span style={{ fontSize: '.8rem', color: 'var(--fg-mid)' }}>{job.location}</span>
                    {job.visit_count > 0 && (
                      <span style={{ fontSize: '.8rem', color: 'var(--fg-soft)' }}>
                        {job.total_visits ? `Visit ${job.visit_count} of ${job.total_visits}` : `${job.visit_count} visit${job.visit_count > 1 ? 's' : ''}`}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '.76rem', fontWeight: 700, whiteSpace: 'nowrap' }} className={STATUS_COLOURS[job.status]}>
                  {STATUS_LABELS[job.status]}
                </span>
                {job.amount && (
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '.95rem', fontVariantNumeric: 'tabular-nums' }}>€{job.amount.toLocaleString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
// force rebuild Fri Nov  6 16:14:33 GMT 2026
