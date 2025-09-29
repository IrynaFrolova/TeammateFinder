import { useEffect, useRef, useState } from 'react'

export default function Toolbar({ dict, selectedTags, toggleTag, flt, setFlt }) {
  // локальный порядок тегов + сохранение
  const [order, setOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quickTagsOrder')||'null') || dict.quickTags }
    catch { return dict.quickTags }
  })
  useEffect(()=>{ localStorage.setItem('quickTagsOrder', JSON.stringify(order)) }, [order])
  useEffect(()=>{
    const set = new Set(order)
    const merged = [...order, ...dict.quickTags.filter(t => !set.has(t))]
    if (merged.length !== order.length) setOrder(merged)
  }, [dict.quickTags])

  const dragItem = useRef(null)
  const onDragStart = (t) => (e) => { dragItem.current = t; e.dataTransfer.effectAllowed='move' }
  const onDragOver = (t) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect='move' }
  const onDrop = (t) => (e) => {
    e.preventDefault()
    const from = dragItem.current
    if (!from || from===t) return
    const arr = [...order]
    const i = arr.indexOf(from), j = arr.indexOf(t)
    if (i<0 || j<0) return
    arr.splice(i,1); arr.splice(j,0,from)
    setOrder(arr)
    dragItem.current = null
  }

  const onSel = (key) => (e) => setFlt(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <section className="toolbar">
      <div className="panel">
        <h3>Quick tags</h3>
        <div className="chips">
          {order.map(t => {
            const pressed = selectedTags.has(t)
            return (
              <button
                key={t}
                className="chip"
                aria-pressed={pressed}
                onClick={()=>toggleTag(t)}
                type="button"
                draggable
                onDragStart={onDragStart(t)}
                onDragOver={onDragOver(t)}
                onDrop={onDrop(t)}
                title="Drag to reorder"
              >#{t}</button>
            )
          })}
        </div>
      </div>

      <div className="panel">
        <h3>Filters</h3>
        <div className="filters">
          <select value={flt.game} onChange={onSel('game')}>
            <option value="">Any game/hobby</option>
            {dict.games.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={flt.level} onChange={onSel('level')}>
            <option value="">Any level</option>
            {dict.levels.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={flt.lang} onChange={onSel('lang')}>
            <option value="">Any language</option>
            {dict.langs.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={flt.platform} onChange={onSel('platform')}>
            <option value="">Any platform</option>
            {dict.platforms.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={flt.time} onChange={onSel('time')}>
            <option value="">Any time</option>
            {dict.times.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
    </section>
  )
}
    