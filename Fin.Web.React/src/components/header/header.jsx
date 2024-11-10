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
    <header className=" text-white p-4">
      <h1>Ola</h1>
    </header>
  );
}
