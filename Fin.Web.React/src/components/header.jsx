import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PieChart, DollarSign, Wallet, Sun, Moon, Bell, AlignJustify, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

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

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Força o logout mesmo se houver erro
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  return (
    <header className="bg-green-950 dark:bg-gray-800 text-white p-4 transition-colors duration-200">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
          <img src="/logotipo.png" alt="MF Logo" className="h-8 w-auto mr-2 sm:h-10" />
        </Link>
        
        <div className="flex items-center lg:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none mr-2"
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated && (
            <>
              <button
                className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none mr-2"
                aria-label="Notificações"
              >
                <Bell size={18} />
              </button>
              <button
                className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <AlignJustify size={18} />
              </button>
            </>
          )}
        </div>

        <nav
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } w-full lg:flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 mt-4 lg:mt-0 lg:w-auto`}
        >
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center hover:text-green-300 transition-colors ${
                  location.pathname === '/dashboard' ? 'text-green-300' : ''
                }`}
              >
                <PieChart className="mr-1" size={18} />
                <span className="text-sm sm:text-base">Dashboard</span>
              </Link>
              <Link
                to="/transactions"
                className={`flex items-center hover:text-green-300 transition-colors ${
                  location.pathname === '/transactions' ? 'text-green-300' : ''
                }`}
              >
                <DollarSign className="mr-1" size={18} />
                <span className="text-sm sm:text-base">Transações</span>
              </Link>
              <Link
                to="/budget"
                className={`flex items-center hover:text-green-300 transition-colors ${
                  location.pathname === '/budget' ? 'text-green-300' : ''
                }`}
              >
                <Wallet className="mr-1" size={18} />
                <span className="text-sm sm:text-base">Orçamento</span>
              </Link>
            </>
          )}
          
          <div className="hidden lg:flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated && (
              <>
                <button
                  className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none ml-2"
                  aria-label="Notificações"
                >
                  <Bell size={18} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700 transition-colors focus:outline-none ml-2"
                  aria-label="Sair"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}