import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({
  q,
  setQ,
  onClear,
  onCreate,
  count,
  theme,
  setTheme,
  toggleToolbar,
  user,
  onLogout,
  onLoginClick,
}) {
  return (
    <header className="site">
      <div className="wrap site__in">
        <div className="logo">
          Teammate<b>Finder</b>
        </div>

        <form className="site__search" role="search">
          <input
            id="q"
            type="search"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <nav className="quick" aria-label="Quick actions">
          <button
            className="btn btn-filters"
            type="button"
            onClick={toggleToolbar}
          >
            Filters
          </button>

          <span className="meta" aria-live="polite">
            {count} results
          </span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="btn btn-clear" type="button" onClick={onClear}>
            Clear
          </button>

          {/* Логика отображения кнопок входа/выхода/создания */}
          {user ? (
            <>
              <button
                className="btn btn--primary btn-create"
                type="button"
                onClick={onCreate}
              >
                Create post
              </button>
              <button
                className="btn btn-logout"
                type="button"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn btn--primary"
              type="button"
              onClick={onLoginClick}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
