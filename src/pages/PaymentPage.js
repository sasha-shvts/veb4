import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

function PaymentPage({ user }) {
  const [cartItems, setCartItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    const fetchPaymentCart = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "rentals"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const rentalsFromDb = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            equipment: data.equipment,
            days: data.days,
            totalPrice: data.totalPrice,
            start: data.start,
            end: data.end,
          };
        });

        setCartItems(rentalsFromDb);
      } catch (err) {
        console.error("Помилка завантаження кошика з Firestore:", err);
      }
    };

    fetchPaymentCart();
  }, [user]);

  useEffect(() => {
    const sum = cartItems.reduce(
      (acc, item) => acc + (Number(item.totalPrice) || 0),
      0
    );
    setAmount(sum);
  }, [cartItems]);

  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, "rentals", id));
      setCartItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
    } catch (err) {
      console.error("Помилка видалення з кошика:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amount <= 0) {
      alert("Немає товарів для оплати.");
      return;
    }

    try {
      for (const item of cartItems) {
        await deleteDoc(doc(db, "rentals", item.id));
      }

      alert("Оплату успішно виконано!");
      setCartItems([]);

      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
    } catch (err) {
      console.error("Помилка під час оплати:", err);
      alert("Не вдалося завершити оплату.");
    }
  };

  return (
    <main>
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
                type="button"
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