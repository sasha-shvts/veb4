import React, { useState, useEffect, useRef } from "react";
import Flatpickr from "react-flatpickr";
import equipmentData from "../data/equipmentData";
import Toast from "../components/Toast";

function normalizeDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
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
  const totalPrice = rental.price * days;

  return { days, totalPrice };
}

function EquipmentPage() {
  // Список обладнання для показу
  const [equipment, setEquipment] = useState([]);

  // Кошик оренди
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("rentCart")) || [];
  });

  // Окремий кошик для оплати
  const [paymentCart, setPaymentCart] = useState(() => {
    return JSON.parse(localStorage.getItem("rentPaymentCart")) || [];
  });

  const [rentStats, setRentStats] = useState(() => {
    return JSON.parse(localStorage.getItem("rentStats")) || {};
  });

  const [filter, setFilter] = useState("Всі");

  const [message, setMessage] = useState("");

  const [addedId, setAddedId] = useState(null);

  // Коментарі користувачів
  const [comments, setComments] = useState(() => {
    return JSON.parse(localStorage.getItem("comments")) || [];
  });

  // Поля форми коментаря
  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
  });

  // Toast-сповіщення
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Додаткова інформація
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const pickersRef = useRef({}); // Ref для збереження екземплярів Flatpickr для кожного товару

  useEffect(() => {
    setEquipment(equipmentData);
  }, []);

  useEffect(() => {
    localStorage.setItem("rentCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("rentPaymentCart", JSON.stringify(paymentCart));
  }, [paymentCart]);

  useEffect(() => {
    localStorage.setItem("rentStats", JSON.stringify(rentStats));
  }, [rentStats]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const filteredEquipment =
    filter === "Всі"
      ? equipment
      : equipment.filter((item) => item.sportType === filter);

  // Додає оренду в кошик, статистику та paymentCart
  const addRentForItem = (item, title, startStr, endStr) => {
    const rentalEntry = {
      id: Date.now() + Math.random(),
      equipment: title,
      price: item.price,
      start: startStr,
      end: endStr,
      img: item.img,
    };

    const { days, totalPrice } = calculateDaysAndPrice(rentalEntry);

    if (days <= 0) {
      alert("Некоректний діапазон дат!");
      return;
    }

    rentalEntry.days = days;
    rentalEntry.totalPrice = totalPrice;

    setCart((prev) => [...prev, rentalEntry]);

    // Статистика рахує, скільки разів брали цей товар в оренду
    const cleanTitle = item.name;
    setRentStats((prev) => ({
      ...prev,
      [cleanTitle]: (prev[cleanTitle] || 0) + 1,
    }));

    setPaymentCart((prev) => [...prev, { ...rentalEntry }]);

    setMessage("Додано до оренди!");
    setAddedId(item.id || item.name);

    setToastMessage("Обладнання додано в оренду");
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 2500);

    setTimeout(() => {
      setMessage("");
      setAddedId(null);
    }, 2000);
  };

  // Відкриває прихований календар для вибраного товару
  const handleRentClick = (item) => {
    const key = item.id || item.name;
    const pickerInstance = pickersRef.current[key];

    if (pickerInstance && pickerInstance.flatpickr) {
      pickerInstance.flatpickr.open();
    }
  };

  // Знаходимо найпопулярніший товар
  let popularName = null;
  let maxCount = 0;

  for (const name in rentStats) {
    if (rentStats[name] > maxCount) {
      maxCount = rentStats[name];
      popularName = name;
    }
  }

  // Оновлення полів форми коментаря
  const handleFormChange = (e) => {
    const { id, value } = e.target;

    if (id === "user-name") setForm((prev) => ({ ...prev, name: value }));
    if (id === "user-email") setForm((prev) => ({ ...prev, email: value }));
    if (id === "user-comment") setForm((prev) => ({ ...prev, comment: value }));
  };

  // Додає новий коментар
  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.comment) {
      alert("Будь ласка, заповніть всі поля!");
      return;
    }

    const newComment = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      text: form.comment,
      datetime: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    setForm({ name: "", email: "", comment: "" });
  };

  // Видаляє коментар після підтвердження
  const deleteComment = (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей коментар?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <main>
        {/* Блок з додатковою інформацією */}
        <section className="extra-info">
          <h2>Додаткова інформація</h2>

          <button
            type="button"
            className="info-toggle-btn"
            onClick={() => setShowExtraInfo((prev) => !prev)}
          >
            {showExtraInfo ? "Приховати інформацію" : "Показати інформацію"}
          </button>

          {showExtraInfo && (
            <p className="extra-info-text">
              Наша платформа створена для тих, хто любить активний відпочинок,
              але не хоче купувати дороге спорядження. Ви просто обираєте
              необхідне обладнання, задаєте дати оренди та оформлюєте замовлення
              онлайн — усе займає кілька хвилин.
            </p>
          )}

          {/* Кнопки категорій */}
          <div className="extra-info-chips">
            <button
              type="button"
              className={
                "extra-chip" +
                (selectedCategory === "велоспорт" ? " extra-chip-active" : "")
              }
              onClick={() => setSelectedCategory("велоспорт")}
            >
              Велоспорт
            </button>

            <button
              type="button"
              className={
                "extra-chip" +
                (selectedCategory === "теніс" ? " extra-chip-active" : "")
              }
              onClick={() => setSelectedCategory("теніс")}
            >
              Теніс
            </button>

            <button
              type="button"
              className={
                "extra-chip" +
                (selectedCategory === "зимові" ? " extra-chip-active" : "")
              }
              onClick={() => setSelectedCategory("зимові")}
            >
              Зимові види спорту
            </button>

            <button
              type="button"
              className={
                "extra-chip" +
                (selectedCategory === "водні" ? " extra-chip-active" : "")
              }
              onClick={() => setSelectedCategory("водні")}
            >
              Водні види спорту
            </button>
          </div>

          {/* Текст для вибраної категорії */}
          <div className="extra-info-details">
            {!selectedCategory && (
              <p>Натисніть на категорію, щоб побачити опис.</p>
            )}

            {selectedCategory === "велоспорт" && (
              <p>
                У розділі велоспорту ви знайдете гірські, міські та
                прогулянкові велосипеди для різних типів маршрутів. Доступні
                моделі для новачків і досвідчених райдерів, з різними розмірами
                рам та колес. Ми також пропонуємо шоломи, замки та додаткові
                аксесуари, щоб зробити ваші поїздки безпечними та комфортними.
              </p>
            )}

            {selectedCategory === "теніс" && (
              <p>
                У тенісній категорії доступні ракетки для дорослих і дітей,
                м’ячі тренувальної та матчевої якості, а також сітки й базове
                спорядження для тренувань. Ви можете орендувати комплект для
                гри в залі або на відкритому корті, не витрачаючись на купівлю
                власного інвентарю.
              </p>
            )}

            {selectedCategory === "зимові" && (
              <p>
                Зимове спорядження включає лижі, сноуборди, черевики, палиці та
                захисні шоломи для катання на гірськолижних курортах. Ми
                підбираємо спорядження з урахуванням вашого зросту, ваги та
                рівня підготовки, щоб забезпечити стабільність і контроль на
                схилі. За потреби ви можете доповнити комплект маскою,
                рукавицями та іншими аксесуарами.
              </p>
            )}

            {selectedCategory === "водні" && (
              <p>
                У водній категорії ви знайдете каяки, SUP-дошки та рятувальні
                жилети, які підходять для відпочинку на озерах і спокійних
                річках. Спорядження розраховане як на спокійні прогулянки, так
                і на більш активне катання. Ми рекомендуємо завжди
                використовувати засоби безпеки та заздалегідь планувати маршрут
                на воді.
              </p>
            )}
          </div>
        </section>

        {/* Список обладнання */}
        <section>
          <h2>Обладнання</h2>

          <label>
            Фільтр за категорією
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option>Всі</option>
              <option value="велоспорт">Велоспорт</option>
              <option value="теніс">Теніс</option>
              <option value="зимові">Зимові</option>
              <option value="водні">Водні</option>
            </select>
          </label>

          {message && <p style={{ color: "green" }}>{message}</p>}

          <div className="equipment-grid">
            {filteredEquipment.map((item, index) => {
              const isPremium = item.price > 400;
              const baseTitle = item.name;

              const displayTitle =
                isPremium && !baseTitle.includes("★")
                  ? `★ ${baseTitle} (Преміум)`
                  : baseTitle;

              const cleanTitle = baseTitle
                .replace(/^★\s*/, "")
                .replace(" (Преміум)", "");

              const isPopular = popularName && cleanTitle === popularName;

              const key = item.id || item.name;
              const isAdded = addedId === key;

              return (
                <article
                  key={key}
                  className="equipment-card"
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "#f0f8ff" : "#e8f5e9",
                    position: "relative",
                  }}
                >
                  {item.img && <img src={item.img} alt={displayTitle} />}

                  <h3>{displayTitle}</h3>
                  {item.short && <p>{item.short}</p>}

                  {item.features && item.features.length > 0 && (
                    <ul>
                      {item.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}

                  <p className="price">{item.price} грн / день</p>

                  <button
                    type="button"
                    onClick={() => handleRentClick(item)}
                    className={isAdded ? "rented" : ""}
                  >
                    {isAdded
                      ? "Додано ✓"
                      : isPopular
                      ? "Популярна оренда"
                      : "Орендувати"}
                  </button>

                  <Flatpickr
                    ref={(el) => {
                      if (el) {
                        pickersRef.current[key] = el;
                      }
                    }}
                    options={{
                      mode: "range",
                      dateFormat: "Y-m-d",
                      minDate: "today",
                      onClose: (selectedDates) => {
                        if (selectedDates.length !== 2) return;

                        const [start, end] = selectedDates;
                        const startStr = start.toISOString().split("T")[0];
                        const endStr = end.toISOString().split("T")[0];

                        addRentForItem(item, baseTitle, startStr, endStr);
                      },
                    }}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }}
                  />
                </article>
              );
            })}
          </div>
        </section>

        {/* Коментарі */}
        <section>
          <h2>Коментарі</h2>

          <form onSubmit={handleCommentSubmit} id="comment-form">
            <input
              id="user-name"
              placeholder="Ім’я"
              value={form.name}
              onChange={handleFormChange}
            />
            <input
              id="user-email"
              placeholder="Email"
              value={form.email}
              onChange={handleFormChange}
            />
            <textarea
              id="user-comment"
              placeholder="Коментар"
              value={form.comment}
              onChange={handleFormChange}
            />
            <button type="submit">Надіслати</button>
          </form>

          <div id="comments-list">
            {comments
              .slice()
              .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
              .map((c) => (
                <div key={c.id} className="comment">
                  <div className="comment-header">
                    <h4>{c.name}</h4>
                    <span className="comment-date">
                      {new Date(c.datetime).toLocaleString()}
                    </span>
                    <button
                      className="delete-comment-btn"
                      onClick={() => deleteComment(c.id)}
                      type="button"
                    >
                      Видалити
                    </button>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))}
          </div>
        </section>
      </main>

      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}

export default EquipmentPage;