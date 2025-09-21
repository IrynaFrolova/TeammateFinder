import { forwardRef, useRef } from 'react'

const MessageDialog = forwardRef(function MessageDialog({ post, onCancel, onSend }, ref) {
  const formRef = useRef()

  const handleSend = () => {
    const fd = new FormData(formRef.current)
    const ok = onSend({
      text: fd.get('text'),
      contact: fd.get('contact')
    })
    if (ok) formRef.current.reset()
  }

  return (
    <dialog ref={ref}>
      <form method="dialog">
        <div className="modal__head">
          <strong>Message {post?.author?.name ? `– ${post.author.name}` : ''}</strong>
          <button className="btn" value="close" aria-label="Close">✕</button>
        </div>
      </form>

      <div className="modal__body">
        <div style={{marginBottom:12}}>
          <div style={{fontWeight:700}}>{post?.title}</div>
          <div className="meta">{post?.game} • {post?.level} • {post?.lang} • {post?.platform} • {post?.time}</div>
        </div>

        <form className="form" ref={formRef}>
          <div style={{gridColumn:'1 / -1'}}>
            <label>Your message</label>
            <textarea name="text" placeholder="Hi! I’m interested in your post. Free in the evenings, have Discord voice…" required />
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <label>Contact (Discord, Telegram, email)</label>
            <input name="contact" placeholder="discordUser#1234 or @tg or email" />
          </div>
        </form>
      </div>

      <div className="modal__foot">
        <button className="btn" onClick={onCancel} type="button">Cancel</button>
        <button className="btn btn--primary" onClick={handleSend} type="button">Send</button>
      </div>
    </dialog>
  )
})

export default MessageDialog
