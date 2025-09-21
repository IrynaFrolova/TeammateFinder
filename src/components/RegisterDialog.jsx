import { forwardRef, useEffect, useState } from 'react'

const RegisterDialog = forwardRef(({ onSave, initialName = '' }, ref) => {
  const [name, setName] = useState(initialName)
  useEffect(()=>{ setName(initialName) }, [initialName])

  const submit = (e) => {
    e.preventDefault()
    const v = name.trim()
    if (!v) return
    onSave?.(v)
    ref.current?.close()
  }

  return (
    <dialog ref={ref}>
      <form method="dialog" onSubmit={submit} className="form" style={{padding:16, minWidth:320}}>
        <h3 style={{margin:'0 0 8px'}}>Your nickname</h3>
        <p style={{margin:'0 0 12px', color:'var(--muted)'}}>Used as author name.</p>
        <input
          autoFocus
          placeholder="Your nickname"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
          style={{padding:10, borderRadius:10, border:'1px solid var(--border)', background:'#0e141d', color:'var(--text)'}}
        />
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
          <button className="btn" type="button" onClick={()=>ref.current?.close()}>Cancel</button>
          <button className="btn btn--primary" type="submit">Save</button>
        </div>
      </form>
    </dialog>
  )
})

export default RegisterDialog