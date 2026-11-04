import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <div style={{
          width: '52px', height: '52px', background: 'var(--green)', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '10px' }}>Láimhe</h1>
        <p style={{ color: 'var(--fg-mid)', marginBottom: '32px', lineHeight: 1.6 }}>Job management for Irish tradespeople. Track every job from enquiry to payment.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/login" style={{
            display: 'block', padding: '13px 24px', background: 'var(--green)', color: '#fff',
            borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '.95rem', textAlign: 'center'
          }}>Log in</Link>
          <Link href="/signup" style={{
            display: 'block', padding: '13px 24px', background: 'transparent', color: 'var(--fg)',
            border: '2px solid var(--border-mid)', borderRadius: '100px', textDecoration: 'none',
            fontWeight: 600, fontSize: '.95rem', textAlign: 'center'
          }}>Create account</Link>
        </div>
      </div>
    </div>
  )
}
