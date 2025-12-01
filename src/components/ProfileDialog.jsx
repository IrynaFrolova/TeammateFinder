import { forwardRef, useState, useEffect } from "react";

const ProfileDialog = forwardRef(({ user, onLogout, onSaveProfile }, ref) => {
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setBio(user.profile.bio || "");
      setSkills(user.profile.skills ? user.profile.skills.join(", ") : "");
      setAvatarUrl(user.profile.avatarUrl || "");
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
    onSaveProfile({ bio, skills: skillsArray, avatarUrl });
    setIsEditing(false);
  };

  if (!user) return null;

  const AvatarDisplay = () => {
    if (avatarUrl) {
        return <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />;
    }
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#2563eb", color: "white", fontSize: "32px", fontWeight: "bold" }}>
            {user.username.charAt(0).toUpperCase()}
        </div>
    );
  };

  // --- ЖОРСТКІ СТИЛІ ДЛЯ ПОЛІВ ---
  // Це гарантує, що поля будуть виглядати так, як ми хочемо, незалежно від теми Windows
  const inputStyle = {
      backgroundColor: '#2b2b2b', // Темно-сірий фон
      color: '#ffffff',           // Білий текст
      border: '1px solid #555',
      borderRadius: '6px',
      padding: '10px',
      width: '100%',
      fontSize: '14px',
      outline: 'none',
      display: 'block'
  };

  return (
    <dialog ref={ref} onClose={() => setIsEditing(false)}>
      <div className="modal__head">
        <strong>Профіль користувача</strong>
        <button className="btn btn-icon" onClick={() => ref.current?.close()}>✕</button>
      </div>

      <div className="modal__body" style={{ minWidth: 320, padding: "24px" }}>
        
        {/* АВАТАР */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ 
            width: "100px", height: "100px", 
            borderRadius: "50%", overflow: "hidden", 
            margin: "0 auto 12px", border: "4px solid var(--bg-body)"
          }}>
            <AvatarDisplay />
          </div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>{user.username}</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "14px" }}>{user.email}</p>
        </div>

        {!isEditing ? (
          // --- РЕЖИМ ПЕРЕГЛЯДУ ---
          <div style={{ display: "grid", gap: "16px" }}>
            
            <div style={{ 
                background: "var(--bg-input)", 
                border: "1px solid var(--border)",
                padding: "16px", borderRadius: "8px" 
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                Про мене
              </strong>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: '1.5' }}>
                {user.profile?.bio || <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>Інформація відсутня...</span>}
              </p>
            </div>
            
            <div style={{ 
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                padding: "16px", borderRadius: "8px" 
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                Навички
              </strong>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {user.profile?.skills?.length > 0 ? (
                    user.profile.skills.map((skill, i) => (
                        <span key={i} style={{ 
                            background: "var(--bg-body)", 
                            border: "1px solid var(--border)",
                            color: "var(--text-main)",
                            padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" 
                        }}>
                            {skill}
                        </span>
                    ))
                ) : (
                    <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>Не вказано</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <button className="btn btn--primary" onClick={() => setIsEditing(true)}>Редагувати профіль</button>
                <button className="btn" onClick={onLogout} style={{ color: "#ef4444", borderColor: "#ef4444", background: 'transparent' }}>Вийти</button>
            </div>
          </div>
        ) : (
          // --- РЕЖИМ РЕДАГУВАННЯ (З Inline Styles) ---
          <form onSubmit={handleSave} className="form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label>Фото профілю (URL)</label>
                <input 
                    type="text" 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)} 
                    placeholder="https://..."
                    style={inputStyle} // <--- ЗАСТОСОВУЄМО СТИЛЬ
                />
            </div>

            <div>
                <label>Про себе</label>
                <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={4}
                    placeholder="Розкажіть про свій досвід..."
                    style={inputStyle} // <--- ЗАСТОСОВУЄМО СТИЛЬ
                />
            </div>
            <div>
                <label>Навички (через кому)</label>
                <input 
                    type="text" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)} 
                    placeholder="Java, React, Design..."
                    style={inputStyle} // <--- ЗАСТОСОВУЄМО СТИЛЬ
                />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="submit" className="btn btn--primary">Зберегти</button>
                <button type="button" className="btn" onClick={() => setIsEditing(false)}>Скасувати</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
});

export default ProfileDialog;