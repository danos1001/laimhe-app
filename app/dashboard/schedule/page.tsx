'use client'
import { useEffect, useState } from 'react'
import { supabase, Job, STATUS_LABELS, STATUS_COLOURS } from '@/lib/supabase'
import Link from 'next/link'

function getWeekDays(offset: number): Date[] {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [today] = useState(() => new Date())

  const week = getWeekDays(weekOffset)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['scheduled', 'in_progress'])
      setJobs(data ?? [])
      setLoading(false)
    })
  }, [])

  // For demo: assign scheduled jobs to days based on created_at (until scheduling feature added)
  // Jobs with status "scheduled" show on their created_at day in the current week if applicable
  const jobsForDay = (day: Date) => {
    return jobs.filter(j => {
      const created = new Date(j.created_at)
      return isSameDay(created, day)
    })
  }

  const allScheduled = jobs.filter(j => j.status === 'scheduled')

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: '4px' }}>Schedule</h1>
          <p style={{ color: 'var(--fg-soft)', fontSize: '.9rem' }}>{allScheduled.length} scheduled job{allScheduled.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: '8px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>←</button>
          <button onClick={() => setWeekOffset(0)} style={{ padding: '8px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', background: weekOffset === 0 ? 'var(--green)' : 'transparent', color: weekOffset === 0 ? '#fff' : 'var(--fg)', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>Today</button>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: '8px 14px', border: '1px solid var(--border-mid)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>→</button>
        </div>
      </div>

      {/* Week label */}
      <p style={{ fontSize: '.85rem', color: 'var(--fg-mid)', marginBottom: '16px', fontWeight: 600 }}>
        {week[0].toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })} – {week[6].toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '32px' }}>
        {week.map((day, i) => {
          const isToday = isSameDay(day, today)
          const dayJobs = jobsForDay(day)
          return (
            <div key={i} style={{
              background: '#fff', border: `1px solid ${isToday ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '10px', padding: '12px', minHeight: '120px',
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: isToday ? 'var(--green)' : 'var(--fg-soft)' }}>{dayLabels[i]}</span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', marginTop: '4px',
                  background: isToday ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '.9rem', fontWeight: 700, color: isToday ? '#fff' : 'var(--fg)' }}>{day.getDate()}</span>
                </div>
              </div>
              {dayJobs.map(j => (
                <Link key={j.id} href={`/dashboard/jobs/${j.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '6px' }}>
                  <div style={{ background: 'var(--green-light)', borderRadius: '6px', padding: '5px 8px' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.customer_name}</p>
                    <p style={{ fontSize: '.68rem', color: 'var(--green)', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_type}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        })}
      </div>

      {/* All scheduled jobs list */}
      {!loading && allScheduled.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>All scheduled jobs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allScheduled.map(job => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: '3px' }}>{job.customer_name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--fg-mid)' }}>{job.job_type} · {job.location}</div>
                  </div>
                  {job.total_visits && (
                    <span style={{ fontSize: '.82rem', color: 'var(--fg-soft)' }}>Visit {job.visit_count + 1} of {job.total_visits}</span>
                  )}
                  <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '.76rem', fontWeight: 700 }} className={STATUS_COLOURS[job.status]}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && allScheduled.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-soft)' }}>
          <p>No scheduled jobs right now.</p>
          <Link href="/dashboard" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '12px' }}>View all jobs →</Link>
        </div>
      )}
    </div>
  )
}
