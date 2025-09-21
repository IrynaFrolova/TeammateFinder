import { forwardRef, useEffect, useRef } from 'react'

const EditPostDialog = forwardRef(function EditPostDialog({ dict, post, onCancel, onSave }, ref){
  const formRef = useRef()

  useEffect(()=>{
    if (!post) return
    const f = formRef.current
    f.title.value = post.title || ''
    f.game.value = post.game || ''
    f.level.value = post.level || dict.levels[0]
    f.lang.value = post.lang || dict.langs[0]
    f.platform.value = post.platform || dict.platforms[0]
    f.time.value = post.time || dict.times[0]
    f.tags.value = (post.tags||[]).join(', ')
    f.desc.value = post.desc || ''
  }, [post, dict])

  const onSubmit = () => {
    const fd = new FormData(formRef.current)
    onSave(post.id, Object.fromEntries(fd.entries()))
  }

  return (
    <dialog ref={ref}>
      <form method="dialog">
        <div className="modal__head">
          <strong>Edit post</strong>
          <button className="btn" value="close" aria-label="Close">✕</button>
        </div>
      </form>

      <div className="modal__body">
        <form ref={formRef} className="form">
          <div><label>Title</label><input name="title" required maxLength={80} /></div>
          <div>
            <label>Game / Hobby</label>
            <input name="game" list="gamesDatalist-edit" required />
            <datalist id="gamesDatalist-edit">
              {dict.games.map(g => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div><label>Level</label><select name="level">{dict.levels.map(v=><option key={v}>{v}</option>)}</select></div>
          <div><label>Language</label><select name="lang">{dict.langs.map(v=><option key={v}>{v}</option>)}</select></div>
          <div><label>Platform</label><select name="platform">{dict.platforms.map(v=><option key={v}>{v}</option>)}</select></div>
          <div><label>Time</label><select name="time">{dict.times.map(v=><option key={v}>{v}</option>)}</select></div>
          <div style={{gridColumn:'1 / -1'}}><label>Tags</label><input name="tags" /></div>
          <div style={{gridColumn:'1 / -1'}}><label>Description</label><textarea name="desc" maxLength={600} /></div>
        </form>
      </div>

      <div className="modal__foot">
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" type="button" onClick={onSubmit}>Save</button>
      </div>
    </dialog>
  )
})

export default EditPostDialog
