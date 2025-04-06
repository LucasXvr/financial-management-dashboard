import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5110/v1',
  headers: { 'Content-Type': 'application/json' },
});

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await api.post('/auth/register', { email, password });
      setSuccessMsg('Conta criada com sucesso!');
      setTimeout(() => navigate('/'), 2000); // Redireciona após 2 segundos
    } catch (err) {
      setError('Erro ao criar conta. Verifique os dados ou tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Criar Conta</h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Senha</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white" required />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 dark:bg-blue-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-all duration-200">
            Criar Conta
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">Entrar</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;