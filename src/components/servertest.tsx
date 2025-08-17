// src/ServerTest.tsx
import { useEffect, useState } from "react";

type Item = { _id: string; name: string };

function ServerTest() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("https://rayquiza-backend.onrender.com/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Items from MongoDB</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ServerTest;
