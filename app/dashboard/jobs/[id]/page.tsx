'use client'
import { useEffect, useState } from 'react'
import { supabase, Job, JobStatus, STATUS_LABELS, STATUS_COLOURS } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const STATUSES: JobStatus[] = ['enquiry', 'quoted', 'scheduled', 'in_progress', 'awaiting_invoice', 'paid']

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('*').eq('id', id).single().then(({ data }) => {
      setJob(data)
      setLoading(false)
    })
  }, [id])

  async function updateStatus(status: JobStatus) {
    if (!job) return
    setSaving(true)
    await supabase.from('jobs').update({ status }).eq('id', id)
    setJob({ ...job, status })
    setSaving(false)
  }

  async function logVisit() {
    if (!job) return
    setSaving(true)
    const newCount = job.visit_count + 1
    await supabase.from('jobs').update({ visit_count: newCount }).eq('id', id)
    setJob({ ...job, visit_count: newCount })
    setSaving(false)
  }

  async function deleteJob() {
    if (!confirm('Delete this job? This cannot be undone.')) return
    await supabase.from('jobs').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (loading) return <div style={{ padding: '32px', color: 'var(--fg-soft)' }}>Loading…</div>
  if (!job) return <div style={{ padding: '32px', color: 'var(--fg-soft)' }}>Job not found.</div>

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ color: 'var(--fg-soft)', textDecoration: 'none', fontSize: '.9rem' }}>← All Jobs</Link>
        <span style={{ color: 'var(--border-mid)' }}>/</span>
        <span style={{ fontSize: '.9rem', color: 'var(--fg-mid)' }}>{job.customer_name}</span>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '6px' }}>{job.customer_name}</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: '4px', background: 'var(--green-light)', color: 'var(--green)' }}>{job.job_type}</span>
            <span style={{ color: 'var(--fg-mid)', fontSize: '.9rem' }}>{job.location}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href={`/dashboard/jobs/${id}/edit`} style={{ padding: '7px 16px', border: '1px solid var(--border-mid)', borderRadius: '100px', textDecoration: 'none', color: 'var(--fg-mid)', fontWeight: 600, fontSize: '.82rem' }}>
            Edit
          </Link>
          <span style={{ padding: '5px 14px', borderRadius: '100px', fontSize: '.8rem', fontWeight: 700 }} className={STATUS_COLOURS[job.status]}>
          {STATUS_LABELS[job.status]}
          </span>
        </div>
      </div>

      {/* Status pipeline */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--fg-soft)', marginBottom: '14px' }}>Move to stage</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving || s === job.status}
              style={{
                padding: '7px 16px', borderRadius: '100px', fontSize: '.8rem', fontWeight: 600,
                border: s === job.status ? '2px solid var(--green)' : '1px solid var(--border-mid)',
                background: s === job.status ? 'var(--green-light)' : 'transparent',
                color: s === job.status ? 'var(--green)' : 'var(--fg-mid)',
                cursor: s === job.status ? 'default' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Details card */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[
            { label: 'Priority', value: job.priority.charAt(0).toUpperCase() + job.priority.slice(1) },
            { label: 'Amount', value: job.amount ? `€${job.amount.toLocaleString()}` : '—' },
            { label: 'Visits logged', value: `${job.visit_count}${job.total_visits ? ` of ${job.total_visits}` : ''}` },
            { label: 'Added', value: new Date(job.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--fg-soft)', marginBottom: '4px' }}>{item.label}</p>
              <p style={{ fontWeight: 600, fontSize: '.95rem' }}>{item.value}</p>
            </div>
          ))}
        </div>
        {job.description && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--fg-soft)', marginBottom: '8px' }}>Notes</p>
            <p style={{ lineHeight: 1.6, color: 'var(--fg-mid)', fontSize: '.9rem' }}>{job.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={logVisit} disabled={saving}
          style={{ padding: '11px 22px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          + Log visit
        </button>
        {job.status === 'in_progress' && (
          <button
            onClick={() => updateStatus('awaiting_invoice')} disabled={saving}
            style={{ padding: '11px 22px', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            Mark complete — send invoice
          </button>
        )}
        <button
          onClick={deleteJob}
          style={{ padding: '11px 22px', background: 'transparent', color: '#dc2626', border: '1px solid rgba(220,38,38,.25)', borderRadius: '100px', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', marginLeft: 'auto' }}
        >
          Delete job
        </button>
      </div>
    </div>
  )
}
