import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PieChart, DollarSign, Wallet, Sun, Moon, Bell, Search } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-green-950 dark:bg-gray-800 text-white p-4 transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/logotipo.png" alt="MF Logo" className="h-10 w-auto mr-2" />
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className={`flex items-center hover:text-green-300 transition-colors ${
              location.pathname === '/dashboard' ? 'text-green-300' : ''
            }`}
          >
            <PieChart className="mr-1" size={20} />
            Dashboard
          </Link>
          <Link to="/transactions" className={`flex items-center hover:text-green-300 transition-colors ${
              location.pathname === '/transactions' ? 'text-green-300' : ''
            }`}
          >
            <DollarSign className="mr-1" size={20} />
            Transações
          </Link>
          <Link to="/budget" className={`flex items-center hover:text-green-300 transition-colors ${
              location.pathname === '/budget' ? 'text-green-300' : ''
            }`}
          >
            <Wallet className="mr-1" size={20} />
            Orçamento
          </Link>
          <button
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
            aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
            aria-label="Notificações"
          >
            <Bell size={20} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
            aria-label="Pesquisar"
          >
            <Search size={20} />
          </button>
        </nav>
      </div>
    </header>
  );
}
