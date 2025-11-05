import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Owners from "./pages/Owners";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";

export default function App() {
  return (
    <Router>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🐾 Pet Care Management
        </h1>

        <nav className="flex gap-4 justify-center mb-6">
          <Link to="/">Home</Link>
          <Link to="/owners">Owners</Link>
          <Link to="/pets">Pets</Link>
          <Link to="/appointments">Appointments</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
      </div>
    </Router>
  );
}
