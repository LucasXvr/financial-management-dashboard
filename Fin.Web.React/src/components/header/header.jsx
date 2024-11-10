import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PieChart, DollarSign, Wallet, Sun, Moon, Bell, Search } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-green-950 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FinTrack</h1>
        <nav className="flex items-center space-x-4">
          <Link to="/dashboard" className={`flex items-center ${location.pathname === '/dashboard' ? 'text-green-300' : ''}`}>
            <PieChart className="mr-1" size={20} />
            Dashboard
          </Link>
          <Link to="/transactions" className={`flex items-center ${location.pathname === '/transactions' ? 'text-green-300' : ''}`}>
            <DollarSign className="mr-1" size={20} />
            Transações
          </Link>
          <Link to="/budget" className={`flex items-center ${location.pathname === '/budget' ? 'text-green-300' : ''}`}>
            <Wallet className="mr-1" size={20} />
            Orçamento
          </Link>
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-green-700">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 rounded-full hover:bg-green-700">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-green-700">
            <Search size={20} />
          </button>
        </nav>
      </div>
    </header>
  );
}
