import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5110/v1',
  headers: { 'Content-Type': 'application/json' },
});

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('Instruções enviadas para seu e-mail.');
    } catch (err) {
      setStatus('Erro ao enviar instruções. Verifique o e-mail e tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Recuperar Senha</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {status && <div className="text-sm text-blue-600 dark:text-blue-400">{status}</div>}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 dark:bg-blue-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-all duration-200">
            Enviar Instruções
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Lembrou sua senha?{' '}
          <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">Entrar</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;