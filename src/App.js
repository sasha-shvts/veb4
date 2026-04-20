import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import EquipmentPage from "./pages/EquipmentPage";
import RentalsPage from "./pages/RentalsPage";
import PaymentPage from "./pages/PaymentPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import "./index.css";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Завантаження...</p>;
  }

  return (
    <div className="app-root">
      <header className="main-header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo">SportRent</span>
          </div>

          <nav className="main-nav">
            <NavLink to="/" end>
              Обладнання
            </NavLink>

            <NavLink to="/rentals">Мої оренди</NavLink>

            <NavLink to="/payment">Оплата</NavLink>

            {!user && (
              <>
                <NavLink to="/register">Реєстрація</NavLink>
                <NavLink to="/login">Вхід</NavLink>
              </>
            )}
          </nav>

          <div>
            {user ? (
              <>
                <span style={{ marginRight: "10px" }}>{user.email}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Вийти
                </button>
              </>
            ) : (
              <span>Гість</span>
            )}
          </div>
        </div>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<EquipmentPage user={user} />} />

          <Route
            path="/rentals"
            element={
              <ProtectedRoute user={user}>
                <RentalsPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute user={user}>
                <PaymentPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>

      <footer>
        <p>© 2026 SportRent. Усі права захищені.</p>
        <p>
          Email:{" "}
          <a href="mailto:shvets@sportrent.ua">shvets@sportrent.ua</a> | Телефон:
          +38 (098) 153-22-07
        </p>
      </footer>
    </div>
  );
}

export default App;