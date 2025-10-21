import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MenuPage() {
  const { slug } = useParams();
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/menu/${slug}`) //slug is table no.
      .then((res) => res.json())
      .then((data) => {
        setMenu(data.menu || []);
        setTable(data.table || "");
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-3 text-center">
        🍴 Menu for Table {table}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menu.map((item) => (
          <div
            key={item._id}
            className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{item.name}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
            <p className="mt-2 font-bold text-green-600">₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;
