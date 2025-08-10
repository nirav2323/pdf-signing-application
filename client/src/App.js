import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyToken } from './redux/authSlice';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);
  return (
    <div className="pdf-verifier-main">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
    </div>
  );
}

export default App;
