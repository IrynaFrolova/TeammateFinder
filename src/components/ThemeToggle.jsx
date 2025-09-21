export default function ThemeToggle({ theme, setTheme }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button className="btn" type="button" onClick={()=>setTheme(next)} aria-label="Toggle theme">
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
