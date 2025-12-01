import { forwardRef, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// Підключаємося до сервера
const socket = io();

const MessageDialog = forwardRef(({ post, chat, currentUser, isLoading, onCancel, onSend }, ref) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Для авто-скролу

  // 1. Завантаження історії при відкритті
  useEffect(() => {
    if (chat && chat.messages) {
      setMessages(chat.messages);
    } else {
      setMessages([]);
    }
  }, [chat]);

  // 2. Socket.io: Слухаємо нові повідомлення
  useEffect(() => {
    if (!chat) return;

    const channelName = `chat:${chat._id}`;
    socket.on(channelName, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => {
      socket.off(channelName);
    };
  }, [chat]);

  // 3. Скрол вниз при новому повідомленні
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend({ text });
    setText("");
  };

  // Знаходимо ім'я співрозмовника
  const partnerName = chat?.participants?.find(p => p._id !== currentUser?.id)?.username || "User";

  return (
    <dialog ref={ref} onClose={onCancel} className="msg-dialog">
      
      {/* --- ШАПКА (Взято з оригінального дизайну) --- */}
      <div className="modal__head">
        <strong>
            {isLoading ? "Loading..." : `Chat with ${partnerName}`}
        </strong>
        <button className="btn" onClick={onCancel} aria-label="Close">✕</button>
      </div>

      <div className="modal__body" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '500px' }}>
        
        {/* --- ІНФО ПРО ПОСТ (Взято з оригіналу, щоб бачити контекст) --- */}
        {post && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{post.title}</div>
                <div className="meta" style={{ fontSize: '12px', marginTop: '4px' }}>
                    {post.game} • {post.level} • {post.platform}
                </div>
            </div>
        )}

        {/* --- ЗОНА ЧАТУ (Нове) --- */}
        <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px', 
            background: '#fff', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
        }}>
            {isLoading && <p style={{ textAlign: 'center', color: '#888' }}>Connecting to chat...</p>}

            {!isLoading && messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa', marginTop: '20px' }}>
                    <p>No messages yet.</p>
                    <small>Say "Hi" to start the conversation!</small>
                </div>
            )}

            {messages.map((msg, index) => {
                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isMine = senderId === currentUser?.id;

                return (
                    <div key={index} style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMine ? '#2563eb' : '#f1f5f9', // Синій для мене, сірий для іншого
                        color: isMine ? '#fff' : '#1e293b',
                        padding: '8px 14px',
                        borderRadius: '16px',
                        borderBottomRightRadius: isMine ? '4px' : '16px',
                        borderBottomLeftRadius: isMine ? '16px' : '4px',
                        fontSize: '14px',
                        lineHeight: '1.4'
                    }}>
                        <div>{msg.text}</div>
                        <div style={{ 
                            fontSize: '10px', 
                            textAlign: 'right', 
                            marginTop: '4px', 
                            opacity: 0.7 
                        }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* --- ПОЛЕ ВВОДУ (Замість форми контактів) --- */}
        <form onSubmit={handleSend} style={{ 
            padding: '12px', 
            borderTop: '1px solid #eee', 
            background: '#fff',
            display: 'flex',
            gap: '8px'
        }}>
          <input
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            autoFocus
            autoComplete="off"
            style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '24px',
                border: '1px solid #ddd',
                outline: 'none',
                background: '#f8f9fa'
            }}
          />
          <button 
            type="submit" 
            className="btn btn--primary" 
            disabled={!text.trim()}
            style={{ borderRadius: '24px', padding: '0 20px' }}
          >
            Send
          </button>
        </form>

      </div>
    </dialog>
  );
});

export default MessageDialog;