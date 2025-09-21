import { forwardRef, useRef, useState } from 'react'

const MAX_TITLE = 80
const MAX_DESC = 600
const MAX_TAGS = 6

const CreatePostDialog = forwardRef(function CreatePostDialog({ dict, onCancel, onSave }, ref) {
  const formRef = useRef()
  const [errors, setErrors] = useState({})

  const validate = (obj) => {
    const e = {}
    if (!obj.title?.trim()) e.title = 'Title is required'
    if (obj.title?.length > MAX_TITLE) e.title = `Max ${MAX_TITLE} chars`
    if (!obj.game?.trim()) e.game = 'Game/Hobby is required'
    const tags = (obj.tags||'').split(',').map(s=>s.trim()).filter(Boolean)
    if (tags.length > MAX_TAGS) e.tags = `Max ${MAX_TAGS} tags`
    if ((obj.desc||'').length > MAX_DESC) e.desc = `Max ${MAX_DESC} chars`
    return { ok: Object.keys(e).length===0, e }
  }

  const handleSave = () => {
    const fd = new FormData(formRef.current)
    const obj = Object.fromEntries(fd.entries())
    const { ok, e } = validate(obj)
    setErrors(e)
    if (!ok) return
    const saved = onSave(obj)
    if (saved) {
      formRef.current.reset()
      setErrors({})
    }
  }

  const err = (k) => errors[k] ? <div className="meta" style={{color:'var(--danger)'}}>{errors[k]}</div> : null

  return (
    <dialog ref={ref}>
      <form method="dialog">
        <div className="modal__head">
          <strong>Create post</strong>
          <button className="btn" value="close" aria-label="Close">✕</button>
        </div>
      </form>

      <div className="modal__body">
        <form className="form" ref={formRef} id="createForm">
          <div>
            <label>Title</label>
            <input name="title" required maxLength={MAX_TITLE} placeholder="Looking for duo in Valorant" />
            {err('title')}
          </div>
          <div>
            <label>Game / Hobby</label>
            <input name="game" list="gamesDatalist" required placeholder="Valorant" />
            <datalist id="gamesDatalist">
              {dict.games.map(g => <option key={g} value={g} />)}
            </datalist>
            {err('game')}
          </div>
          <div><label>Level</label><select name="level">{dict.levels.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label>Language</label><select name="lang">{dict.langs.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label>Platform</label><select name="platform">{dict.platforms.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label>Time</label><select name="time">{dict.times.map(v => <option key={v}>{v}</option>)}</select></div>
          <div style={{gridColumn:'1 / -1'}}>
            <label>Tags (comma separated)</label>
            <input name="tags" placeholder="EU, DuoQ, Casual" />
            {err('tags')}
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <label>Description</label>
            <textarea name="desc" maxLength={MAX_DESC} placeholder="Short description: rank, goals, voice, schedule…"></textarea>
            {err('desc')}
          </div>
        </form>
      </div>

      <div className="modal__foot">
        <button className="btn" onClick={onCancel} type="button">Cancel</button>
        <button className="btn btn--primary" onClick={handleSave} type="button">Publish</button>
      </div>
    </dialog>
  )
})

export default CreatePostDialog
