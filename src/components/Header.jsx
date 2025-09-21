import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ q, setQ, onSearch, onClear, onCreate, sortBy, setSortBy, count, theme, setTheme }) {
  const onSubmit = (e) => { e.preventDefault(); onSearch?.() }

  return (
    <header className="site">
      <div className="wrap site__in">
        <div className="logo">Teammate<b>Finder</b></div>

        <form className="site__search" role="search" onSubmit={onSubmit}>
          <input
            id="q"
            type="search"
            placeholder="Search by title, description, game or tag…"
            autoComplete="off"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            aria-label="Search posts"
          />
          <button className="btn--primary" type="submit">Search</button>
        </form>

        <nav className="quick" aria-label="Quick actions" style={{gap:8, display:'flex', alignItems:'center'}}>
          <span className="meta" aria-live="polite">{count} results</span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="btn" type="button" onClick={onClear}>Clear</button>
          <button className="btn btn--primary" type="button" onClick={onCreate}>Create post</button>
        </nav>
      </div>
    </header>
  )
}
