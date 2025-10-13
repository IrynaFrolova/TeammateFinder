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
        const score = typeof p._score === "number" ? p._score : 0;
        const fav = favorites.has(p.id);
        const opened = expanded.has(p.id);

        // Перевіряємо, чи може поточний користувач редагувати/видаляти пост
        const canEdit = currentUser && currentUser.username === p.author.name;

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
                <img
                  className="avatar"
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                    p.author?.name || "anon"
                  )}`}
                  alt={p.author?.name || "User"}
                />
                <div>
                  <div className="titleline">
                    <h4 className="title">{p.title}</h4>
                    {isNew(p.createdAt) && (
                      <span className="badge badge--new">NEW</span>
                    )}
                  </div>
                  <div className="meta">
                    {p.game} • {p.level} • {p.lang} • {p.platform} • {p.time} •{" "}
                    {formatAgo(p.createdAt)}
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="card__actions">
                  <button
                    className="btn btn--icon"
                    type="button"
                    onClick={() => onCopyLink(p.id)}
                    aria-label="Copy link"
                  >
                    🔗
                  </button>
                  <button
                    className="btn btn--icon"
                    type="button"
                    onClick={() => onEdit(p)}
                    aria-label="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn--icon"
                    type="button"
                    onClick={() => onDelete(p.id)}
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

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

            <div className="tags">
              {p.tags.map((t) => (
                <span className="tag" key={t}>
                  #{t}
                </span>
              ))}
            </div>

            <div className="card__foot">
              <div className="score" title="match score">
                ★ {score}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => onToggleFavorite(p.id)}
                  type="button"
                >
                  {fav ? "★ Saved" : "☆ Save"}
                </button>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => onMessage(p)}
                >
                  Message
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
