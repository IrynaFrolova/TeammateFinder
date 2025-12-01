import { useEffect, useState } from "react";

export default function Header({
  q, setQ, onClear, onCreate, count, theme, setTheme,
  toggleToolbar, user, onLogout, onLoginClick, onProfileClick,
  onInboxClick // <--- Отримуємо функцію відкриття скриньки
}) {
  const [tempQ, setTempQ] = useState(q);

  useEffect(() => { setTempQ(q); }, [q]);

  const handleSearch = (e) => { e.preventDefault(); setQ(tempQ); };

  return (
    <header className="header" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)', height: '70px', gap: '20px'
    }}>
      
      {/* Логотип */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a href="#" onClick={onClear} style={{ 
          fontSize: '22px', fontWeight: 'bold', textDecoration: 'none', 
          color: 'var(--text-main)', whiteSpace: 'nowrap'
        }}>
          Teammate<span style={{ color: '#2563eb' }}>Finder</span>
        </a>
      </div>

      {/* Пошук */}
      <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '600px', gap: '8px' }}>
        <input
          type="text" placeholder="Search..." value={tempQ}
          onChange={(e) => setTempQ(e.target.value)}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '6px',
            border: '1px solid var(--border)', background: 'var(--bg-input, #f8f9fa)', fontSize: '14px'
          }}
        />
        <button type="submit" className="btn btn--primary" style={{
           background: '#2563eb', color: 'white', padding: '0 24px',
           borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer'
        }}>Search</button>
      </form>

      {/* Права частина */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="desktop-only" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{count} results</span>

        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer'
        }}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <button onClick={onCreate} className="btn btn--primary" style={{
            background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none',
            fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
        }}>Create post</button>

        {/* --- ЛОГІКА ВІДОБРАЖЕННЯ --- */}
        {user ? (
          <>
            {/* Кнопка INBOX (Тільки для залогінених) */}
            <button 
                onClick={onInboxClick}
                title="My Messages"
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '22px', padding: '0 8px'
                }}
            >
                ✉️
            </button>

{/* Профіль */}
            <button onClick={onProfileClick} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '50px', cursor: 'pointer'
            }}>
                <div style={{
                    width: '32px', height: '32px', background: '#2563eb', color: 'white', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', overflow: 'hidden'
                }}>
                    {user.profile?.avatarUrl ? <img src={user.profile.avatarUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : user.username.charAt(0).toUpperCase()}
                </div>
                
                <span className="desktop-only" style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
                    {user.username}
                </span>

                {/* --- АДМІНСЬКИЙ ЗНАЧОК --- */}
                {user.isAdmin && (
                    <span style={{ 
                        background: '#ffd700', color: 'black', 
                        fontSize: '10px', padding: '2px 6px', 
                        borderRadius: '999px', marginLeft: '6px', fontWeight: 'bold',
                        border: '1px solid #e6c200'
                    }}>
                        ADMIN
                    </span>
                )}


            </button>

            {/* Вихід */}
            <button onClick={onLogout} title="Logout" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', 
                border: '1px solid #ef4444', color: '#ef4444', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer'
            }}>
                🚪
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} style={{
              background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '8px 16px',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
          }}>Log in</button>
        )}
      </div>
    </header>
  );
}