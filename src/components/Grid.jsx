import { useState } from "react";

export default function Grid({
  items,
  formatAgo,
  favorites,
  onToggleFavorite,
  onMessage,
  onEdit,
  onDelete,
  onCopyLink,
  currentUser,
  onLike // <--- Додали функцію лайка
}) {
  const [expanded, setExpanded] = useState(() => new Set());

  const isNew = (iso) =>
    Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="grid" id="grid">
      {items.map((p, index) => {
        const fav = favorites.has(p.id);
        const opened = expanded.has(p.id);
        
        // --- ЛОГІКА ДОСТУПУ (АВТОР АБО АДМІН) ---
        const canEdit = (currentUser && p.author && currentUser.username === p.author.name) || (currentUser?.isAdmin);

        // --- ЛОГІКА АВАТАРА ---
        const avatarSrc = p.author?.avatar 
            ? p.author.avatar 
            : `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(p.author?.name || "anon")}`;

        // --- ЛОГІКА ЛАЙКА ---
        const isLiked = p.likes && currentUser && p.likes.includes(currentUser.id);
        const likesCount = p.likes ? p.likes.length : 0;

        return (
          <article
            key={p.id}
            id={p.id}
            className="card animate-stagger"
            role="article"
            aria-label={p.title}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="card__head">
              <div className="card__head-left">
                {/* АВАТАР */}
                <img
                  className="avatar"
                  src={avatarSrc}
                  alt={p.author?.name || "User"}
                  style={{ objectFit: "cover", background: "#eee" }} 
                />
                
                {/* ТЕКСТ ШАПКИ */}
                <div>
                  <div className="titleline">
                    <h4 className="title">{p.title}</h4>
                    {isNew(p.createdAt) && (
                      <span className="badge badge--new">NEW</span>
                    )}
                  </div>
                  <div className="meta">
                    <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>{p.author?.name}</span> • {p.game} • {p.level} • {p.lang} • {p.platform} • {formatAgo(p.createdAt)}
                  </div>
                </div>
              </div>

              {/* КНОПКИ ДІЙ (Справа зверху) */}
              <div className="card__actions">
                  <button
                    className="btn btn--icon"
                    type="button"
                    onClick={() => onCopyLink(p.id)}
                    aria-label="Copy link"
                    title="Copy Link"
                  >
                    🔗
                  </button>

                  {/* Кнопки редагування (тільки для автора/адміна) */}
                  {canEdit && (
                    <>
                      <button
                        className="btn btn--icon"
                        type="button"
                        onClick={() => onEdit(p)}
                        aria-label="Edit"
                        title="Edit Post"
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn--icon btn-icon--danger"
                        type="button"
                        onClick={() => onDelete(p.id)}
                        aria-label="Delete"
                        title="Delete Post"
                      >
                        🗑️
                      </button>
                    </>
                  )}
              </div>
            </div>

            {/* ОПИС */}
            <p className={`desc ${opened ? "desc--open" : ""}`}>{p.desc}</p>
            {p.desc && p.desc.length > 120 && (
              <button
                className="btn btn--ghost btn--small"
                type="button"
                onClick={() => toggleExpand(p.id)}
              >
                {opened ? "Read less" : "Read more"}
              </button>
            )}

            {/* ТЕГИ */}
            <div className="tags">
              {p.tags.map((t) => (
                <span className="tag" key={t}>
                  #{t}
                </span>
              ))}
            </div>

            {/* ФУТЕР (Кнопки внизу) */}
            <div className="card__foot" style={{ justifyContent: "flex-end" }}> 
              
              <div style={{ display: "flex", gap: 8 }}>
                
                {/* --- НОВА КНОПКА ЛАЙК --- */}
                <button
                  className="btn"
                  onClick={() => onLike(p.id)}
                  type="button"
                  style={{ 
                      minWidth: '60px', 
                      borderColor: isLiked ? '#ffd700' : 'var(--border)',
                      color: isLiked ? '#d4af37' : 'var(--text-main)'
                  }}
                  title="Like"
                >
                  {isLiked ? "★" : "☆"} 
                  <span style={{marginLeft: 6, fontWeight: 'bold'}}>
                      {likesCount}
                  </span>
                </button>

                {/* Кнопка SAVE (Локально) */}
                <button
                  className="btn"
                  onClick={() => onToggleFavorite(p.id)}
                  type="button"
                >
                  {fav ? "★ Saved" : "☆ Save"}
                </button>
                
                {/* Кнопка MESSAGE */}
                {(!currentUser || currentUser.username !== p.author.name) && (
                    <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => onMessage(p)}
                    >
                    Message
                    </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}