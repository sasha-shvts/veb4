import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.log("Firebase login error:", err.code, err.message);
      setError(`${err.code} — ${err.message}`);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-top">
          <h2>Вхід</h2>
          <p>Увійдіть у свій акаунт, щоб керувати орендами.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Пароль
            <input
              className="auth-input"
              type="password"
              placeholder="Ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            Увійти
          </button>
        </form>

        <div className="auth-bottom">
          Немає акаунта?
          <Link to="/register" className="auth-link">
            Зареєструватися
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;