import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [owner, setOwner] = useState(null); // user-ul logat

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={<Login onLogin={setOwner} owner={owner} />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            owner
              ? <Dashboard owner={owner} />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
