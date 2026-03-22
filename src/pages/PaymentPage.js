import React, { useState, useEffect } from "react";

function getPaymentCart() {
  // Отримує кошик для оплати з localStorage.
  try {
    const raw = localStorage.getItem("rentPaymentCart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePaymentCart(cart) {
  localStorage.setItem("rentPaymentCart", JSON.stringify(cart));
}

function PaymentPage() {

  const [cartItems, setCartItems] = useState(() => getPaymentCart());

  const [amount, setAmount] = useState(0);

  const [method, setMethod] = useState("card");

  const [cardNumber, setCardNumber] = useState("");

  const [cardName, setCardName] = useState("");

  const [cardExpiry, setCardExpiry] = useState("");

  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    // Перераховує суму при зміні кошика та зберігає його в localStorage.
    const sum = cartItems.reduce(
      (acc, item) => acc + (Number(item.totalPrice) || 0),
      0
    );
    setAmount(sum);
    savePaymentCart(cartItems);
  }, [cartItems]);

  const handleRemove = (id) => {
    const newCart = cartItems.filter((i) => String(i.id) !== String(id));
    setCartItems(newCart);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (amount <= 0) {
      alert("Немає товарів для оплати.");
      return;
    }

    alert("Оплату успішно виконано!");
    setCartItems([]);
    savePaymentCart([]);

    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
  };

  return (
    <main>
      {/* Блок кошика */}
      <div
        id="cart-summary"
        style={{
          marginBottom: "20px",
          padding: "16px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <h3>Ваш кошик</h3>

        <div className="cart-items">
          {cartItems.length === 0 && <p>Кошик порожній.</p>}

          {cartItems.map((item) => (
            <p key={item.id}>
              {item.equipment} — {item.days} дн. — {item.totalPrice} грн
              <button
                className="remove-btn"
                style={{ marginLeft: 8 }}
                onClick={() => handleRemove(item.id)}
              >
                Видалити
              </button>
            </p>
          ))}
        </div>

        <p>
          Разом: <span id="cart-total">{amount} грн</span>
        </p>
      </div>

      {/* Форма оплати */}
      <section id="payment">
        <h2>Оплата</h2>

        <p className="payment-subtitle">
          Виберіть спосіб оплати та введіть дані картки.
        </p>

        <form id="payment-form" onSubmit={handleSubmit}>
          <label>
            Сума до оплати (грн)
            <input
              type="number"
              name="amount"
              id="amount-input"
              min="0"
              placeholder="0"
              required
              readOnly
              value={amount}
            />
          </label>

          <label>
            Спосіб оплати
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="card">Банківська картка</option>
              <option value="cash">Готівка при отриманні</option>
              <option value="transfer">Банківський переказ</option>
            </select>
          </label>

          <label>
            Номер картки
            <input
              type="text"
              name="card-number"
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              required={method === "card"}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </label>

          <label>
            Ім’я власника картки
            <input
              type="text"
              name="card-name"
              placeholder="Ім’я Прізвище"
              required={method === "card"}
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </label>

          <label>
            Дата закінчення дії
            <input
              type="month"
              name="card-expiry"
              required={method === "card"}
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
            />
          </label>

          <label>
            CVV
            <input
              type="password"
              name="card-cvv"
              maxLength="4"
              inputMode="numeric"
              pattern="[0-9]{3,4}"
              required={method === "card"}
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
            />
          </label>

          <button type="submit">Оплатити</button>
        </form>
      </section>
    </main>
  );
}

export default PaymentPage;
