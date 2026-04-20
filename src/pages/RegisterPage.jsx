import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.log("Firebase register error:", err.code, err.message);
      setError(`${err.code} — ${err.message}`);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-top">
          <h2>Реєстрація</h2>
          <p>Створіть акаунт, щоб оформлювати оренду і переглядати свої замовлення.</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
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
              placeholder="Мінімум 6 символів"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Підтвердження пароля
            <input
              className="auth-input"
              type="password"
              placeholder="Повторіть пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            Зареєструватися
          </button>
        </form>

        <div className="auth-bottom">
          Вже маєте акаунт?
          <Link to="/login" className="auth-link">
            Увійти
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;