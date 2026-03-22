import React, { useState, useEffect, useMemo } from "react";

function normalizeDate(dateStr) {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + "T00:00:00");
  date.setHours(0, 0, 0, 0);
  return date;
}

function calculateDaysAndPrice(rental) {
  const start = normalizeDate(rental.start);
  const end = normalizeDate(rental.end);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = end - start;
  if (diff < 0) {
    return { days: 0, totalPrice: 0 };
  }

  const days = Math.floor(diff / msPerDay) + 1;
  const price = Number(rental.price) || 0;
  const totalPrice = price * days;
  return { days, totalPrice };
}

function getCart() {
  try {
    const raw = localStorage.getItem("rentCart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("rentCart", JSON.stringify(cart));
}

function RentalsPage() {

  const [cart, setCart] = useState(() => getCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const orderedCart = useMemo(() => {
    // Розділяє оренди на активні та завершені.
    if (!cart.length) return [];

    const active = [];
    const finished = [];

    for (let k = 0; k < cart.length; k++) {
      const r = cart[k];
      if (!r || !r.end) continue;

      const endDateObj = normalizeDate(r.end);
      if (endDateObj.getTime() >= todayTime) {
        active.push(r);
      } else {
        finished.push(r);
      }
    }

    return [...active, ...finished];
  }, [cart, todayTime]);

  const handleCancel = (rental) => {
    // Скасовує оренду після підтвердження користувача.
    if (!window.confirm("Скасувати оренду?")) return;

    const newCart = cart.filter((r) => r.id !== rental.id);
    setCart(newCart);
    saveCart(newCart);
  };

  return (
    <main>
      <section id="my-rentals">
        <h2>Мої оренди</h2>

        {!orderedCart.length && (
          <p>Наразі у вас немає оренд. Додайте обладнання на головній сторінці.</p>
        )}

        <div className="rentals-grid">
          {orderedCart.map((rental) => {
            // Для кожної оренди визначаємо стиль, статус і суму.

            const equipmentName = rental.equipment || "";
            const nameLower = equipmentName.toLowerCase();

            let bgClass = "";
            if (nameLower.includes("велосипед")) bgClass = "rental-bike";
            else if (nameLower.includes("теніс")) bgClass = "rental-tennis";
            else if (nameLower.includes("сноуборд")) bgClass = "rental-snowboard";
            else if (nameLower.includes("роликов")) bgClass = "rental-rollers";
            else if (nameLower.includes("sup")) bgClass = "rental-sup";
            else if (nameLower.includes("кемпінг")) bgClass = "rental-camping";
            else if (nameLower.includes("лиж")) bgClass = "rental-skis";
            else if (nameLower.includes("трекінг")) bgClass = "rental-trekking";
            else if (nameLower.includes("каяк")) bgClass = "rental-kayak";

            const start = normalizeDate(rental.start);
            const end = normalizeDate(rental.end);

            let statusText = "АКТИВНА";
            let statusClass = "active";
            let showBadge = false;

            if (today > end) {
              statusText = "ЗАВЕРШЕНА";
              statusClass = "finished";
            } else if (today.getTime() === end.getTime()) {
              showBadge = true;
            }

            const { days, totalPrice } = calculateDaysAndPrice(rental);

            return (
              <article
                key={rental.id}
                className={`rental-card ${statusClass} ${bgClass}`}
              >
                <header
                  style={
                    rental.img
                      ? { backgroundImage: `url(${rental.img})` }
                      : undefined
                  }
                >
                  <h3>{equipmentName || "Без назви"}</h3>
                  <span className="rental-status">{statusText}</span>
                </header>

                {showBadge && (
                  <span className="ending-today">Закінчується сьогодні</span>
                )}

                <p className="rental-date">
                  {rental.start || "—"} — {rental.end || "—"}
                </p>
                <p className="rental-meta">
                  {days} дн. • {totalPrice} грн
                </p>

                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(rental)}
                >
                  Скасувати оренду
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default RentalsPage;
