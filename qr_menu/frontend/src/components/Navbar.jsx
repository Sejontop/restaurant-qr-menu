export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-red-600">Scan & Dine</h1>
        <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm">
          View Cart
        </button>
      </div>
    </nav>
  );
}
