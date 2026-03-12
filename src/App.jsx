import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
// Оставляем твои компоненты, но убедись, что в них нет "золотого" цвета
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home'; // Твой основной контент
import Login from './pages/Login';
import Register from './pages/Register';
// ... (остальные импорты)

function App() {
  const location = useLocation();
  const hideFooter = ['/login', '/register', '/profile', '/buy', '/admin'].includes(location.pathname);

  // ЛОГИКА ЗАЩИТЫ (оставляем, как ты просил)
  useEffect(() => {
    const blockEvent = (e) => e.preventDefault();
    document.addEventListener('contextmenu', blockEvent);
    document.addEventListener('copy', blockEvent);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && ['s', 'u', 'i', 'c'].includes(e.key.toLowerCase()))) e.preventDefault();
    });
    return () => { /* remove listeners */ };
  }, []);

  return (
    <motion.div 
      className="app-container" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff' }}
    >
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* ... (остальные маршруты) */}
      </Routes>

      {!hideFooter && <Footer />}
    </motion.div>
  );
}

export default App;
