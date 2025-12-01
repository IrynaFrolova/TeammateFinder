import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Toolbar from "./components/Toolbar.jsx";
import Grid from "./components/Grid.jsx";
import CreatePostDialog from "./components/CreatePostDialog.jsx";
import EditPostDialog from "./components/EditPostDialog.jsx";
import MessageDialog from "./components/MessageDialog.jsx";
import AuthDialog from "./components/RegisterDialog.jsx";
import { DICT, initialPosts as seed } from "./data.js";
import ProfileDialog from "./components/ProfileDialog.jsx";
import ChatListDialog from "./components/ChatListDialog.jsx";
import { io } from "socket.io-client";

function useLocalFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
  }, [favorites]);
  return [favorites, setFavorites];
}

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

function formatAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  const m = diff / 60,
    h = m / 60,
    d = h / 24;
  if (m < 60) return Math.floor(m) + "m ago";
  if (h < 24) return Math.floor(h) + "h ago";
  return Math.floor(d) + "d ago";
}

function parseURLState() {
  const p = new URLSearchParams(location.search);
  const tags = new Set(
    (p.get("tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const flt = {
    game: p.get("game") || "",
    level: p.get("level") || "",
    lang: p.get("lang") || "",
    platform: p.get("platform") || "",
    time: p.get("time") || "",
  };
  return {
    q: p.get("q") || "",
    selectedTags: tags,
    flt,
    sortBy: p.get("sort") || "score",
    savedOnly: p.get("saved") === "1",
  };
}

function pushURLState({ q, selectedTags, flt, sortBy, savedOnly }) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (selectedTags.size) p.set("tags", [...selectedTags].join(","));
  for (const k of Object.keys(flt)) if (flt[k]) p.set(k, flt[k]);
  if (sortBy !== "score") p.set("sort", sortBy);
  if (savedOnly) p.set("saved", "1");
  const qs = p.toString();
  const url = qs ? `?${qs}` : location.pathname;
  history.replaceState(null, "", url);
}

export default function App() {
  const [theme, setTheme] = useTheme();
  
  // --- 1. СТАН ПОСТІВ (Починаємо з пустих, завантажимо з сервера) ---
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState(DICT.games);

  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  
  const authDlgRef = useRef(null);
  const profileDlgRef = useRef(null);
  const chatListDlgRef = useRef(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

// --- ЗВУКОВЕ СПОВІЩЕННЯ ---
  useEffect(() => {
    if (!currentUser) return;

    // Підключаємося до сокета глобально в App
    const socket = io();
    const notificationChannel = `notification:${currentUser.id}`;

    socket.on(notificationChannel, (data) => {
        console.log("🔔 Отримано сповіщення:", data);
        
        // 1. Відтворюємо звук
        // (Можна замінити посилання на будь-який mp3 файл)
        const audio = new Audio("/notification_sound.wav");
        
		audio.volume = 0.6;
        // Тиха спроба відтворити (браузери іноді блокують звук, якщо юзер нічого не натискав)
        audio.play().catch(err => console.log("Браузер заблокував авто-звук:", err));

        // 2. Можна також показати системне спливаюче вікно (Alert або Toast)
        //alert(`Нове повідомлення від ${data.senderName}!`); // (За бажанням, розкоментуй)
    });

    return () => {
        socket.off(notificationChannel);
        socket.disconnect();
    };
  }, [currentUser]);

  // --- 2. ЗАВАНТАЖЕННЯ: Беремо пости з сервера ---
  useEffect(() => {
    fetch('/api/posts')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                // Адаптуємо формат MongoDB (_id) під наш формат (id)
                const adaptedPosts = data.map(post => ({
                    ...post,
                    id: post._id, 
                    author: { 
                        name: post.author?.username || "Unknown", 
                        avatar: post.author?.profile?.avatarUrl 
                    }
                }));
                setPosts(adaptedPosts);
            }
        })
        .catch(err => console.error("Помилка завантаження постів:", err));
  }, []);

  // Перевірка сесії (вхід)
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("username");
    
    if (storedId && storedName) {
        // Спробуємо підтягнути актуальний профіль з сервера
        fetch(`/api/users/${storedName}`)
            .then(res => res.json())
            .then(data => {
                setCurrentUser({ 
                    id: data._id || storedId, 
                    username: data.username, 
                    profile: data.profile,
					isAdmin: data.isAdmin
                });
            })
            .catch(() => {
                // Якщо сервер не відповів, беремо локальні дані
                setCurrentUser({ id: storedId, username: storedName });
            });
    }
  }, []);

  const toggleToolbar = () => {
    setIsToolbarOpen(!isToolbarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setCurrentUser(null);
    window.location.reload();
  };

  // Відкриття профілю
  const openProfile = () => {
    profileDlgRef.current?.showModal();
  };

// ВІДКРИТТЯ СПИСКУ ЧАТІВ
  const openInbox = () => {
      if (!currentUser) return;
      chatListDlgRef.current?.showModal();
  };

  // ВІДКРИТТЯ КОНКРЕТНОГО ЧАТУ ЗІ СПИСКУ
  const handleSelectChatFromList = (chat) => {
      setCurrentChat(chat);
      // Якщо це чат по оголошенню - пробуємо його показати в заголовку
      setMessageTarget(chat.relatedAd || { title: "Чат" });
      msgDlgRef.current?.showModal();
  };

  // Збереження профілю
  const handleSaveProfile = async (newProfileData) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(newProfileData)
      });
      
      const data = await response.json();
      if (response.ok) {
         setCurrentUser(prev => ({ ...prev, profile: data.user.profile }));
         alert("Профіль оновлено!");
      } else {
         alert("Помилка: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Помилка з'єднання");
    }
  };
  
  
  // --- ЛАЙКИ ---
  const onLike = async (id) => {
    if (!currentUser) {
        alert("Увійдіть, щоб оцінити пост!");
        authDlgRef.current?.showModal();
        return;
    }

    try {
        const response = await fetch(`/api/posts/${id}/like`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });

        if (response.ok) {
            const updatedPostRaw = await response.json();
            
            // Адаптуємо під формат фронтенду
            const updatedPost = {
                ...updatedPostRaw,
                id: updatedPostRaw._id,
                author: { 
                    name: updatedPostRaw.author?.username || "Unknown", 
                    avatar: updatedPostRaw.author?.profile?.avatarUrl 
                }
            };

            // Оновлюємо цей пост у списку
            setPosts((list) => list.map((p) => (p.id === id ? updatedPost : p)));
        }
    } catch (err) {
        console.error(err);
    }
  };
  
  // Заглушки для AuthDialog (він сам робить запити)
  const handleLogin = async () => {};
  const handleRegister = async () => {};
  const handleGoogleLogin = async (googleResponse) => {
    // googleResponse містить credential (це і є токен)
    try {
        const response = await fetch('/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleResponse.credential })
        });

        const data = await response.json();

        if (response.ok) {
            // Зберігаємо сесію
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);
            
            // Оновлюємо стейт
            setCurrentUser({ 
                id: data.userId, 
                username: data.username, 
                profile: data.profile,
                isAdmin: data.isAdmin 
            });

            authDlgRef.current?.close(); // Закриваємо вікно
            alert(`Вітаємо, ${data.username}!`);
            window.location.reload(); // Перезавантажуємо для надійності
        } else {
            setAuthError(data.message || "Помилка Google входу");
        }
    } catch (error) {
        console.error(error);
        setAuthError("Помилка з'єднання");
    }
  };

  const init = parseURLState();
  const [q, setQ] = useState(init.q);
  const [selectedTags, setSelectedTags] = useState(init.selectedTags);
  const [flt, setFlt] = useState(init.flt);
  const [sortBy, setSortBy] = useState(init.sortBy);
  const [savedOnly, setSavedOnly] = useState(init.savedOnly);

  useEffect(() => {
    pushURLState({ q, selectedTags, flt, sortBy, savedOnly });
  }, [q, selectedTags, flt, sortBy, savedOnly]);

  const [favorites, setFavorites] = useLocalFavorites();

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  const createDlgRef = useRef();
  const editDlgRef = useRef();
  const msgDlgRef = useRef();
  const [editingPost, setEditingPost] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [currentChat, setCurrentChat] = useState(null); // Новий стейт
  const [isChatLoading, setIsChatLoading] = useState(false); // Стан завантаження

  // Оновлена функція відкриття
  const openMessage = async (post) => {
    if (!currentUser) {
        alert("Увійдіть, щоб написати повідомлення");
        authDlgRef.current?.showModal();
        return;
    }

    if (post.author.name === currentUser.username) {
        alert("Це ваше оголошення");
        return;
    }

    setIsChatLoading(true);
    
    try {
        // Питаємо сервер: "Дай чат для цього посту"
        const response = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adId: post.id,
                userId: currentUser.id
            })
        });

        const chatData = await response.json();

        if (response.ok) {
            setCurrentChat(chatData); 
            setMessageTarget(post);
            msgDlgRef.current?.showModal();
        } else {
            alert(chatData.message);
        }
    } catch (error) {
        console.error(error);
        alert("Помилка відкриття чату");
    } finally {
        setIsChatLoading(false);
    }
  };

  const closeMessage = () => {
    msgDlgRef.current?.close();
    setMessageTarget(null);
    setCurrentChat(null);
  };

  // Оновлена функція відправки
  const sendMessage = async ({ text }) => {
      if (!currentChat || !currentUser) return;

      try {
          await fetch(`/api/chats/${currentChat._id}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  text,
                  senderId: currentUser.id
              })
          });
          // Повідомлення прийде через Socket.io (або оновиться при відкритті)
      } catch (error) {
          console.error("Помилка відправки:", error);
      }
  };
  
  const computeScore = (p) => {
    let s = 0;
    if (flt.game && p.game === flt.game) s += 3;
    if (flt.level && p.level === flt.level) s += 1;
    if (flt.lang && p.lang === flt.lang) s += 2;
    if (flt.platform && p.platform === flt.platform) s += 2;
    if (flt.time && p.time === flt.time) s += 2;
    for (const t of selectedTags) if (p.tags.includes(t)) s += 1;
    if (q) {
      const hay = (
        p.title + " " + p.desc + " " + p.game + " " + p.tags.join(" ")
      ).toLowerCase();
      if (hay.includes(q.toLowerCase())) s += 2;
    }
    return s;
  };

  const filtered = useMemo(() => {
    let arr = posts.filter((p) => {
      if (savedOnly && !favorites.has(p.id)) return false;
      for (const k of Object.keys(flt))
        if (flt[k] && p[k] !== flt[k]) return false;
      for (const t of selectedTags) if (!p.tags.includes(t)) return false;
      if (q) {
        const hay = (
          p.title + " " + p.desc + " " + p.game + " " + p.tags.join(" ")
        ).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    if (sortBy === "score") {
      arr = arr
        .map((p) => ({ p, score: computeScore(p) }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            new Date(b.p.createdAt) - new Date(a.p.createdAt)
        )
        .map((x) => ({ ...x.p, _score: x.score }));
    } else if (sortBy === "date") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "title") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [posts, flt, selectedTags, q, sortBy, savedOnly, favorites]);

  useEffect(() => {
    setPage(1);
  }, [q, selectedTags, flt, sortBy, savedOnly]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef.current]);

  const visible = filtered.slice(0, PAGE_SIZE * page);
  const hasMore = visible.length < filtered.length;

  const toggleTag = (t) => {
    const next = new Set(selectedTags);
    next.has(t) ? next.delete(t) : next.add(t);
    setSelectedTags(next);
  };
  const clearAll = () => {
    setQ("");
    setSelectedTags(new Set());
    setFlt({ game: "", level: "", lang: "", platform: "", time: "" });
    setSortBy("score");
    setSavedOnly(false);
  };
  const toggleFavorite = (id) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavorites(next);
  };

  const openCreate = () => {
    if (currentUser) {
      createDlgRef.current?.showModal();
    } else {
      authDlgRef.current?.showModal();
    }
  };
  const closeCreate = () => createDlgRef.current?.close();

  // --- 3. СТВОРЕННЯ (SERVER) ---
  const createPost = async (obj) => {
    if (!currentUser) {
        alert("Будь ласка, увійдіть!");
        authDlgRef.current?.showModal();
        return false;
    }

    const newPostData = {
        userId: currentUser.id, // ID автора
        title: obj.title.trim(),
        game: obj.game.trim(),
        level: obj.level,
        lang: obj.lang,
        platform: obj.platform,
        time: obj.time,
        tags: (obj.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
        desc: (obj.desc || "").trim(),
    };

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPostData)
        });

        if (response.ok) {
            const savedPost = await response.json();
            
            const adaptedPost = {
                ...savedPost,
                id: savedPost._id,
                author: { 
                    name: currentUser.username, 
                    avatar: currentUser.profile?.avatarUrl 
                }
            };

            setPosts((prev) => [adaptedPost, ...prev]);
            
            if (!games.includes(adaptedPost.game)) setGames((g) => [...g, adaptedPost.game]);
            
            closeCreate();
            return true;
        } else {
            alert("Помилка при створенні");
        }
    } catch (err) {
        console.error(err);
        alert("Помилка з'єднання");
    }
    return false;
  };

  const onCopyLink = async (id) => {
    const url = `${location.origin}${location.pathname}?${new URLSearchParams(
      location.search
    )}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    alert("Link copied");
  };

  const onEdit = (post) => {
    setEditingPost(post);
    editDlgRef.current?.showModal();
  };
  const onEditCancel = () => {
    editDlgRef.current?.close();
    setEditingPost(null);
  };
const onEditSave = async (id, obj) => {
    // 1. Форматуємо дані (Рядок тегів -> Масив тегів)
    // Це виправить помилку "map is not a function"
    const updatedData = {
        title: obj.title.trim(),
        game: obj.game.trim(),
        level: obj.level,
        lang: obj.lang,
        platform: obj.platform,
        time: obj.time,
        // Обов'язково робимо спліт рядка в масив!
        tags: (typeof obj.tags === 'string' ? obj.tags : "").split(",").map((t) => t.trim()).filter(Boolean),
        desc: (obj.desc || "").trim(),
    };

    try {
        // 2. Відправляємо на сервер
        const response = await fetch(`/api/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const savedPost = await response.json();

            // 3. Оновлюємо локальний стейт правильними даними з сервера
            // Адаптуємо під наш фронт
            const adaptedPost = {
                ...savedPost,
                id: savedPost._id,
                author: { 
                    name: savedPost.author?.username || "Unknown", 
                    avatar: savedPost.author?.profile?.avatarUrl 
                }
            };

            setPosts((list) => list.map((p) => (p.id === id ? adaptedPost : p)));
            
            // Якщо змінили гру - додаємо її в фільтр
            if (!games.includes(adaptedPost.game)) setGames((g) => [...g, adaptedPost.game]);
            
            onEditCancel(); // Закриваємо вікно
        } else {
            alert("Не вдалося зберегти зміни");
        }
    } catch (err) {
        console.error(err);
        alert("Помилка з'єднання");
    }
  };

  // --- 4. ВИДАЛЕННЯ (SERVER) ---
  const onDelete = async (id) => {
    if (!confirm("Видалити це оголошення?")) return;
    
    try {
        const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

        if (response.ok) {
            setPosts((list) => list.filter((p) => p.id !== id));
            const f = new Set(favorites);
            f.delete(id);
            setFavorites(f);
        } else {
            alert("Не вдалося видалити (можливо, вже видалено)");
        }
    } catch (err) {
        console.error(err);
        alert("Помилка сервера");
    }
  };



  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <div className="animate-on-load" style={{ animationDelay: "0.1s" }}>
        <Header
          q={q}
          setQ={setQ}
          onClear={clearAll}
          onCreate={openCreate}
          count={filtered.length}
          theme={theme}
          setTheme={setTheme}
          toggleToolbar={toggleToolbar}
          user={currentUser}
          onLogout={handleLogout}
          onLoginClick={() => authDlgRef.current?.showModal()}
          onProfileClick={openProfile}
		  onInboxClick={openInbox}
        />
      </div>

      <main className="wrap main-layout">
        <Toolbar
          dict={{ ...DICT, games }}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          flt={flt}
          setFlt={setFlt}
          className={isToolbarOpen ? "is-open" : ""}
          onClose={toggleToolbar}
        />
        <div
          className="content-area animate-on-load"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="resultbar" style={{ gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                />
                <span>Saved only</span>
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="sortBy"
              >
                <option value="score">Best match</option>
                <option value="date">Newest</option>
                <option value="title">Title A–Z</option>
              </select>
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
				onLike={onLike}
                currentUser={currentUser}
              />
              {hasMore && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "16px 0",
                  }}
                >
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more
                  </button>
                </div>
              )}
              <div ref={sentinelRef} style={{ height: 1 }} />
            </>
          )}
        </div>
      </main>

      <CreatePostDialog
        ref={createDlgRef}
        dict={{ ...DICT, games }}
        onCancel={closeCreate}
        onSave={createPost}
      />

      <EditPostDialog
        ref={editDlgRef}
        dict={{ ...DICT, games }}
        post={editingPost}
        onCancel={onEditCancel}
        onSave={onEditSave}
      />

<MessageDialog
        ref={msgDlgRef}
        post={messageTarget}
        chat={currentChat}        
        currentUser={currentUser}  
        isLoading={isChatLoading}  
        onCancel={closeMessage}
        onSend={sendMessage}
      />
      <AuthDialog
        ref={authDlgRef}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
        error={authError}
      />
      <ProfileDialog
        ref={profileDlgRef}
        user={currentUser}
        onLogout={handleLogout}
        onSaveProfile={handleSaveProfile}
      />
	  <ChatListDialog 
        ref={chatListDlgRef} 
        currentUser={currentUser} 
        onSelectChat={handleSelectChatFromList} 
      />
    </>
  );
}