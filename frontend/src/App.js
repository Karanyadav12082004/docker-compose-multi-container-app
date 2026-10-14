import React, { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");

  const loadHealth = () =>
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));

  const loadItems = () =>
    fetch("/api/items")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));

  useEffect(() => {
    loadHealth();
    loadItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    loadItems();
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "40px auto" }}>
      <h1>Docker Learning Project</h1>
      <p>Backend health: <strong>{health ? health.status : "loading..."}</strong></p>

      <form onSubmit={addItem} style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New item name"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
