import { forwardRef, useEffect, useState, useRef } from "react";

const AuthDialog = forwardRef(
  ({ onLogin, onRegister, onGoogleLogin, error }, ref) => {
    const [mode, setMode] = useState("login"); // 'login' or 'register'
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const googleBtnRef = useRef(null);

    useEffect(() => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id:
            "553430136363-pt7eafinmqbndka2kj63g42aqh0vhr9q.apps.googleusercontent.com",
          callback: onGoogleLogin,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "300",
        });
      }
    }, [onGoogleLogin]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (mode === "login") {
        onLogin({ email, password });
      } else {
        onRegister({ username, email, password });
      }
    };

    const resetForm = () => {
      setUsername("");
      setEmail("");
      setPassword("");
    };

    const switchMode = (newMode) => {
      setMode(newMode);
      resetForm();
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
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p
                style={{
                  color: "var(--red)",
                  gridColumn: "1 / -1",
                  margin: "8px 0 0",
                  textAlign: "center",
                }}
              >
                {error}
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
