import { forwardRef, useEffect, useState, useRef } from "react";

// Оголошуємо компонент AuthDialog
const AuthDialog = forwardRef(
  ({ onLogin, onRegister, onGoogleLogin, error }, ref) => {
    const [mode, setMode] = useState("login"); // 'login' or 'register'
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState(""); // Локальна помилка
    const googleBtnRef = useRef(null);

    useEffect(() => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id:
            "998358639410-th99n907dqh09f38av4it7eerlrcl9bd.apps.googleusercontent.com",
          callback: onGoogleLogin,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "300",
        });
      }
    }, [onGoogleLogin]);

    // Наша оновлена функція відправки (Login + Register)
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLocalError("");

      // --- ЛОГІКА ВХОДУ (LOGIN) ---
      if (mode === "login") {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok) {
            alert(`З поверненням, ${data.username}!`);
            
            // Зберігаємо дані про сесію
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);

            // Закриваємо вікно
            ref.current?.close();
            resetForm();

            // Перезавантажуємо сторінку
            window.location.reload(); 
          } else {
            setLocalError(data.message || "Помилка входу");
          }
        } catch (err) {
          console.error(err);
          setLocalError("Не вдалося з'єднатися з сервером");
        }
      } 
      // --- ЛОГІКА РЕЄСТРАЦІЇ (REGISTER) ---
      else {
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });

          const data = await response.json();

          if (response.ok) {
            alert(`Реєстрація успішна! Вітаємо, ${username}`);
            
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', username);

            ref.current?.close();
            resetForm();
            window.location.reload(); 
          } else {
            setLocalError(data.message || "Помилка реєстрації");
          }
        } catch (err) {
          console.error(err);
          setLocalError("Не вдалося з'єднатися з сервером");
        }
      }
    };

    const resetForm = () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setLocalError("");
    };

    const switchMode = (newMode) => {
      setMode(newMode);
      resetForm();
    };

    const displayError = localError || error;
	
	const inputStyle = {
        backgroundColor: '#2b2b2b', // Темно-сірий фон
        color: '#ffffff',           // Білий текст
        border: '1px solid #555',
        borderRadius: '6px',
        padding: '10px',
        width: '100%',
        fontSize: '14px',
        outline: 'none',
        display: 'block',
        marginBottom: '10px'
    };

    return (
      <dialog ref={ref} onClose={resetForm}>
        <div className="modal__head">
          <strong>{mode === "login" ? "Login" : "Register"}</strong>
          <button
            className="btn"
            onClick={() => ref.current?.close()}
            value="close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div
          className="modal__body"
          style={{ minWidth: 320, padding: "16px 24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <button
              className={`btn ${mode === "login" ? "btn--primary" : ""}`}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              className={`btn ${mode === "register" ? "btn--primary" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleSubmit} className="form">
            {mode === "register" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label>Nickname</label>
<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
              </div>
            )}
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Email</label>
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Password</label>
<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            {displayError && (
              <p
                style={{
                  color: "var(--red, red)",
                  gridColumn: "1 / -1",
                  margin: "8px 0 0",
                  textAlign: "center",
                }}
              >
                {displayError}
              </p>
            )}
            <div
              className="modal__foot"
              style={{ gridColumn: "1 / -1", padding: "16px 0 0" }}
            >
              <button
                className="btn"
                type="button"
                onClick={() => ref.current?.close()}
              >
                Cancel
              </button>
              <button className="btn btn--primary" type="submit">
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </div>
          </form>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "16px 0",
            }}
          >
            <hr style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
            <span>OR</span>
            <hr style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center" }}
            ref={googleBtnRef}
          />
        </div>
      </dialog>
    );
  }
);

export default AuthDialog;