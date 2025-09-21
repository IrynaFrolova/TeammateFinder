import { useEffect } from 'react'

export default function Toasts({ toasts, remove }) {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => remove(t.id), t.ttl || 2500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, remove])

  return (
    <div style={{
      position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:9999
    }}>
      {toasts.map(t=>(
        <div key={t.id}
          role="status"
          style={{
            padding:'10px 12px',
            borderRadius:10,
            border:'1px solid var(--border)',
            background:'var(--panel)',
            color:'var(--text)',
            boxShadow:'0 6px 16px rgba(0,0,0,.25)',
            minWidth:220
          }}>
          {t.text}
        </div>
      ))}
    </div>
  )
}
