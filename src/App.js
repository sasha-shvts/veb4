import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import EquipmentPage from "./pages/EquipmentPage";
import RentalsPage from "./pages/RentalsPage";
import PaymentPage from "./pages/PaymentPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
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
              <NavLink to="/rentals">
                Мої оренди
              </NavLink>
              <NavLink to="/payment">
                Оплата
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<EquipmentPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
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
    </BrowserRouter>
  );
}

export default App;