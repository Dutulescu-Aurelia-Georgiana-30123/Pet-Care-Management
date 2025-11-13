// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Owners from './pages/Owners';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import ToastContainer from './components/Toast'; // <- DEFAULT import (fără acolade)

export default function App() {
  return (
    <Router>
      <div className="app">
        <ToastContainer />  {/* <- trebuie montat o singură dată în aplicație */}

        <header className="header">
          <h1>🐾 Pet Care Management</h1>
        </header>

        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/owners">Owners</Link>
          <Link to="/pets">Pets</Link>
          <Link to="/appointments">Appointments</Link>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
        </main>

        <footer className="footer">
          © {new Date().getFullYear()} Pet Care Management
        </footer>
      </div>
    </Router>
  );
}
