import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/m/:slug" element={<MenuPage />} />

        {/* more routes here */}
        {/* <Route path="/cart" element={<CartPage />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
