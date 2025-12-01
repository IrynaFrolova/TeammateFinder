import { forwardRef, useEffect, useState } from "react";

const ChatListDialog = forwardRef(({ currentUser, onSelectChat }, ref) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadChats = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Робимо запит
      const res = await fetch(`/api/chats/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Оновлюємо при відкритті (якщо currentUser змінився)
  useEffect(() => {
      if (currentUser) loadChats();
  }, [currentUser]);

  // Додатково: оновлюємо список кожного разу, коли відкриваємо діалог
  // (Використовуємо MutationObserver або просто кнопку оновлення для надійності)

  const handleChatClick = (chat) => {
    onSelectChat(chat);
    ref.current?.close();
  };

  return (
    <dialog ref={ref} className="chat-list-dialog">
      <div className="modal__head">
        <strong>Мої повідомлення</strong>
        <div style={{display: 'flex', gap: '10px'}}>
            {/* Кнопка ручного оновлення (корисно для тесту) */}
            <button className="btn btn--small" onClick={loadChats} title="Оновити список">🔄</button>
            <button className="btn" onClick={() => ref.current?.close()}>✕</button>
        </div>
      </div>

      <div className="modal__body" style={{ padding: 0, height: '400px', overflowY: 'auto' }}>
        {loading && <div style={{padding: 20, textAlign: 'center'}}>Завантаження...</div>}
        
        {!loading && chats.length === 0 && (
            <div style={{padding: 40, textAlign: 'center', color: '#888'}}>
                Пусто. Напишіть комусь! ✉️
            </div>
        )}

        {chats.map(chat => {
            // --- ГОЛОВНА ЛОГІКА ПОШУКУ СПІВРОЗМОВНИКА ---
            // Ми шукаємо учасника, чий ID НЕ дорівнює моєму ID
            const partner = chat.participants.find(p => {
                const pId = typeof p === 'object' ? p._id : p; // Якщо populated - беремо _id, якщо ні - сам рядок
                return String(pId) !== String(currentUser.id); // Порівнюємо як рядки!
            }) || { username: "Невідомий" };

            // Останнє повідомлення
            const lastMsg = chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1] 
                : null;

            const avatarSrc = partner.profile?.avatarUrl;

            return (
                <div 
                    key={chat._id} 
                    onClick={() => handleChatClick(chat)}
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                    {/* Аватар */}
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                        background: '#007bff', color: 'white', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                            (partner.username || "?").charAt(0).toUpperCase()
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{partner.username}</strong>
                            <small style={{ color: '#999', fontSize: '11px' }}>
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : ''}
                            </small>
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {chat.relatedAd ? `Тема: ${chat.relatedAd.title}` : 'Приватна розмова'}
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lastMsg ? (
                                <span style={{color: '#555'}}>{lastMsg.text}</span>
                            ) : (
                                <i style={{color: '#999'}}>Немає повідомлень</i>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </dialog>
  );
});

export default ChatListDialog;