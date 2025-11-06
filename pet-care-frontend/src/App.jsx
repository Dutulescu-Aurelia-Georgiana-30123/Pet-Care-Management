import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Owners from "./pages/Owners";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col">
        {/* HEADER */}
        <header className="bg-white shadow-md p-4">
          <h1 className="text-4xl font-extrabold text-blue-700 text-center">
            🐾 Pet Care Management
          </h1>
        </header>

        {/* NAVBAR */}
        <nav className="flex justify-center gap-6 bg-blue-600 text-white py-3">
          <Link to="/" className="hover:text-yellow-300 font-medium">
            Home
          </Link>
          <Link to="/owners" className="hover:text-yellow-300 font-medium">
            Owners
          </Link>
          <Link to="/pets" className="hover:text-yellow-300 font-medium">
            Pets
          </Link>
          <Link to="/appointments" className="hover:text-yellow-300 font-medium">
            Appointments
          </Link>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl text-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/appointments" element={<Appointments />} />
            </Routes>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-blue-700 text-white text-center py-2 text-sm">
          © {new Date().getFullYear()} Pet Care Management
        </footer>
      </div>
    </Router>
  );
}
