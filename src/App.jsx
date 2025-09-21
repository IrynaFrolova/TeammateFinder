import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Toolbar from './components/Toolbar.jsx'
import Grid from './components/Grid.jsx'
import CreatePostDialog from './components/CreatePostDialog.jsx'
import EditPostDialog from './components/EditPostDialog.jsx'
import MessageDialog from './components/MessageDialog.jsx'
import ImportExport from './components/ImportExport.jsx'
import { DICT, initialPosts as seed } from './data.js'



function useLocalFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('favorites')||'[]')) }
    catch { return new Set() }
  })
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]))
  }, [favorites])
  return [favorites, setFavorites]
}
function useLocalPosts(seed) {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('posts')||'null')
      return Array.isArray(saved) ? saved : seed
    } catch { return seed }
  })
  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts))
  }, [posts])
  return [posts, setPosts]
}
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return [theme, setTheme]
}
function formatAgo(iso){
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  const m = diff/60, h = m/60, d = h/24
  if (m<60) return Math.floor(m)+'m ago'
  if (h<24) return Math.floor(h)+'h ago'
  return Math.floor(d)+'d ago'
}
function parseURLState() {
  const p = new URLSearchParams(location.search)
  const tags = new Set((p.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean))
  const flt = {
    game: p.get('game')||'',
    level: p.get('level')||'',
    lang: p.get('lang')||'',
    platform: p.get('platform')||'',
    time: p.get('time')||'',
  }
  return {
    q: p.get('q')||'',
    selectedTags: tags,
    flt,
    sortBy: p.get('sort')||'score',
    savedOnly: p.get('saved')==='1'
  }
}
function pushURLState({ q, selectedTags, flt, sortBy, savedOnly }) {
  const p = new URLSearchParams()
  if (q) p.set('q', q)
  if (selectedTags.size) p.set('tags', [...selectedTags].join(','))
  for (const k of Object.keys(flt)) if (flt[k]) p.set(k, flt[k])
  if (sortBy !== 'score') p.set('sort', sortBy)
  if (savedOnly) p.set('saved', '1')
  const qs = p.toString()
  const url = qs ? `?${qs}` : location.pathname
  history.replaceState(null, '', url)
}

export default function App() {
  const [theme, setTheme] = useTheme()

  const [posts, setPosts] = useLocalPosts(seed)
  const [games, setGames] = useState(DICT.games)

  

  const init = parseURLState()
  const [q, setQ] = useState(init.q)
  const [selectedTags, setSelectedTags] = useState(init.selectedTags)
  const [flt, setFlt] = useState(init.flt)
  const [sortBy, setSortBy] = useState(init.sortBy)
  const [savedOnly, setSavedOnly] = useState(init.savedOnly)

  useEffect(() => {
    pushURLState({ q, selectedTags, flt, sortBy, savedOnly })
  }, [q, selectedTags, flt, sortBy, savedOnly])

  const [favorites, setFavorites] = useLocalFavorites()



const onLike = (id) => {
  const already = liked.has(id)
  setLiked(prev => {
    const next = new Set(prev)
    already ? next.delete(id) : next.add(id)
    return next
  })
  setPosts(list =>
    list.map(p =>
      p.id === id ? { ...p, likes: (p.likes || 0) + (already ? -1 : 1) } : p
    )
  )
}




  // pagination
  const PAGE_SIZE = 6
  const [page, setPage] = useState(1)
  const sentinelRef = useRef(null)

  // dialogs
  const createDlgRef = useRef()
  const editDlgRef = useRef()
  const msgDlgRef = useRef()
  const [editingPost, setEditingPost] = useState(null)
  const [messageTarget, setMessageTarget] = useState(null)

  const computeScore = (p) => {
    let s = 0
    if (flt.game && p.game === flt.game) s += 3
    if (flt.level && p.level === flt.level) s += 1
    if (flt.lang && p.lang === flt.lang) s += 2
    if (flt.platform && p.platform === flt.platform) s += 2
    if (flt.time && p.time === flt.time) s += 2
    for (const t of selectedTags) if (p.tags.includes(t)) s += 1
    if (q) {
      const hay = (p.title+' '+p.desc+' '+p.game+' '+p.tags.join(' ')).toLowerCase()
      if (hay.includes(q.toLowerCase())) s += 2
    }
    return s
  }

  const filtered = useMemo(() => {
    let arr = posts.filter(p => {
      if (savedOnly && !favorites.has(p.id)) return false
      for (const k of Object.keys(flt)) if (flt[k] && p[k] !== flt[k]) return false
      for (const t of selectedTags) if (!p.tags.includes(t)) return false
      if (q) {
        const hay = (p.title+' '+p.desc+' '+p.game+' '+p.tags.join(' ')).toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })

    if (sortBy === 'score') {
      arr = arr.map(p => ({ p, score: computeScore(p)}))
               .sort((a,b)=> b.score - a.score || new Date(b.p.createdAt) - new Date(a.p.createdAt))
               .map(x => ({ ...x.p, _score: x.score }))
    } else if (sortBy === 'date') {
      arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'title') {
      arr.sort((a,b)=> a.title.localeCompare(b.title))
    }
    return arr
  }, [posts, flt, selectedTags, q, sortBy, savedOnly, favorites])

  // reset page when filters change
  useEffect(()=>{ setPage(1) }, [q, selectedTags, flt, sortBy, savedOnly])

  // autoload on scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage(p => p + 1)
    }, { rootMargin:'200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [sentinelRef.current])

  const visible = filtered.slice(0, PAGE_SIZE * page)
  const hasMore = visible.length < filtered.length

  // actions
  const toggleTag = (t) => {
    const next = new Set(selectedTags)
    next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTags(next)
  }
  const clearAll = () => {
    setQ('')
    setSelectedTags(new Set())
    setFlt({ game:'', level:'', lang:'', platform:'', time:'' })
    setSortBy('score')
    setSavedOnly(false)
  }
  const toggleFavorite = (id) => {
    const next = new Set(favorites)
    next.has(id) ? next.delete(id) : next.add(id)
    setFavorites(next)
  }
  const openCreate = () => createDlgRef.current?.showModal()
  const closeCreate = () => createDlgRef.current?.close()
  const createPost = (obj) => {
    const newPost = {
      id: 'p'+(Math.random().toString(36).slice(2,8)),
      title: obj.title.trim(),
      game: obj.game.trim(),
      level: obj.level,
      lang: obj.lang,
      platform: obj.platform,
      time: obj.time,
      tags: (obj.tags||'').split(',').map(t=>t.trim()).filter(Boolean),
      desc: (obj.desc||'').trim(),
      author: { name: 'You' },
      createdAt: new Date().toISOString()
    }
    if (!newPost.title || !newPost.game) { alert('Please fill Title and Game/Hobby'); return false }
    setPosts(p => [newPost, ...p])
    if (!games.includes(newPost.game)) setGames(g => [...g, newPost.game])
    closeCreate()
    return true
  }

  // Edit/Delete/Copy
  const onCopyLink = async (id) => {
    const url = `${location.origin}${location.pathname}?${new URLSearchParams(location.search)}#${id}`
    try { await navigator.clipboard.writeText(url) } catch {}
    alert('Link copied')
  }
  const onEdit = (post) => { setEditingPost(post); editDlgRef.current?.showModal() }
  const onEditCancel = () => { editDlgRef.current?.close(); setEditingPost(null) }
  const onEditSave = (id, obj) => {
    setPosts(list => list.map(p => p.id===id ? {
      ...p,
      title: obj.title.trim(),
      game: obj.game.trim(),
      level: obj.level, lang: obj.lang, platform: obj.platform, time: obj.time,
      tags: (obj.tags||'').split(',').map(t=>t.trim()).filter(Boolean),
      desc: (obj.desc||'').trim()
    } : p))
    onEditCancel()
  }
  const onDelete = (id) => {
    if (!confirm('Delete this post?')) return
    setPosts(list => list.filter(p => p.id !== id))
    const f = new Set(favorites); f.delete(id); setFavorites(f)
  }

  // Message dialog
  const openMessage = (post) => { setMessageTarget(post); msgDlgRef.current?.showModal() }
  const closeMessage = () => { msgDlgRef.current?.close(); setMessageTarget(null) }

  // 👉 Подключи свои URL, если нужно реальное отправление
  const BACKEND_URL = ''        // например '/api/message'
  const DISCORD_WEBHOOK = ''    // полный webhook URL из Discord

  const sendMessage = async ({ text, contact }) => {
    if (!text?.trim()) { alert('Message cannot be empty'); return false }
    const payload = {
      to: messageTarget?.author?.name || 'author',
      postId: messageTarget?.id,
      title: messageTarget?.title,
      text, contact,
      at: new Date().toISOString()
    }
    try {
      if (BACKEND_URL) {
        await fetch(BACKEND_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      }
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            username: 'Teammate Finder',
            embeds: [{
              title: `New message: ${payload.title}`,
              description: payload.text,
              color: 4886754,
              fields: [
                { name:'Post ID', value: String(payload.postId), inline:true },
                { name:'To', value: String(payload.to), inline:true },
                { name:'Contact', value: String(contact||'—'), inline:true }
              ],
              timestamp: payload.at,
            }]
          })
        })
      }
      closeMessage()
      alert('Message sent ✅')
      return true
    } catch (e) {
      console.error(e)
      alert('Failed to send message')
      return false
    }
  }

  // автоскролл к карточке по #hash
  useEffect(()=>{
    const hash = location.hash.slice(1)
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'})
  }, [])

  // import/export
  const handleImport = (data) => {
    if (!Array.isArray(data)) { alert('Expected an array of posts'); return }
    const normalized = data.map((p,i)=>({
      id: p.id || 'imp'+i+Math.random().toString(36).slice(2,6),
      title: String(p.title||'').slice(0,80),
      game: String(p.game||'').slice(0,50),
      level: p.level||'Beginner',
      lang: p.lang||'EN',
      platform: p.platform||'PC',
      time: p.time||'Evenings',
      tags: Array.isArray(p.tags) ? p.tags.slice(0,6).map(String) : [],
      desc: String(p.desc||'').slice(0,600),
      author: p.author?.name ? { name: String(p.author.name).slice(0,40) } : { name:'Imported' },
      createdAt: p.createdAt && !Number.isNaN(Date.parse(p.createdAt)) ? p.createdAt : new Date().toISOString()
    }))
    setPosts(normalized)
    const newGames = new Set(games)
    normalized.forEach(p => newGames.add(p.game))
    setGames([...newGames])
    alert(`Imported ${normalized.length} posts`)
  }
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teammate-finder-posts.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        q={q}
        setQ={setQ}
        onSearch={()=>{}}
        onClear={clearAll}
        onCreate={openCreate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        count={filtered.length}
        theme={theme}
        setTheme={setTheme}
        
      />

      <main className="wrap">
        <Toolbar
          dict={{...DICT, games}}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          flt={flt}
          setFlt={setFlt}
        />

        <div className="resultbar" style={{gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
              <input type="checkbox" checked={savedOnly} onChange={e=>setSavedOnly(e.target.checked)} />
              <span>Saved only</span>
            </label>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span>Sort by</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} id="sortBy">
              <option value="score">Best match</option>
              <option value="date">Newest</option>
              <option value="title">Title A–Z</option>
            </select>
            <ImportExport onImport={handleImport} onExport={handleExport} />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty">No results. Try removing some filters.</div>
        ) : (
          <>
            <Grid
              items={visible}
              formatAgo={formatAgo}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onMessage={openMessage}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopyLink={onCopyLink}
              
            />
            {hasMore && (
              <div style={{display:'flex',justifyContent:'center',margin:'16px 0'}}>
                <button className="btn" type="button" onClick={()=>setPage(p=>p+1)}>Load more</button>
              </div>
            )}
            <div ref={sentinelRef} style={{height:1}} />
          </>
        )}
      </main>

      <CreatePostDialog
        ref={createDlgRef}
        dict={{...DICT, games}}
        onCancel={closeCreate}
        onSave={createPost}
      />

      <EditPostDialog
        ref={editDlgRef}
        dict={{...DICT, games}}
        post={editingPost}
        onCancel={onEditCancel}
        onSave={onEditSave}
      />

      <MessageDialog
        ref={msgDlgRef}
        post={messageTarget}
        onCancel={closeMessage}
        onSend={sendMessage}
      />
    </>
  )
}
