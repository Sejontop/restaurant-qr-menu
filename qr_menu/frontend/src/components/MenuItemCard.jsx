export default function MenuItemCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={item.imageUrl || "https://via.placeholder.com/300x200?text=Food"}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="font-semibold text-lg text-gray-800">{item.name}</h2>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex justify-between items-center">
          <p className="font-bold text-red-600">₹{item.price}</p>
          <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
