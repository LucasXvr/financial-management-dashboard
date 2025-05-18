import React, { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { NumericFormat } from "react-number-format";
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 size={48} className="text-green-500" />
          <p className="text-center text-gray-700 dark:text-gray-200 text-lg">{message}</p>
          <button
            onClick={onClose}
            className="bg-green-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction, transaction, onEditTransaction }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(1); 
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadCategories = async (page = 1) => {
    try {
      const response = await api.get('/v1/categories', {
        params: {
          pageNumber: page,
          pageSize: 25
        }
      });
      setCategories(response.data.data);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao carregar categorias. Por favor, tente novamente.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories(pageNumber);
    }
  }, [isOpen, pageNumber]);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.title);
      setAmount(Math.abs(transaction.amount).toString());
      setDate(transaction.paidOrReceivedAt.split('T')[0]);
      setType(transaction.amount > 0 ? '1' : '2');
      setCategoryId(transaction.categoryId?.toString() || '');
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('1');
      setCategoryId('');
    }
  }, [transaction]);

  const handleClose = () => {
    onClose();
    setError(null);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim() || !date.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const transactionData = {
        title: description,
        amount: type === '1' ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount)),
        paidOrReceivedAt: date,
        categoryId: categoryId ? parseInt(categoryId) : null,
        type: parseInt(type)
      };

      if (transaction) {
        const response = await api.put(`/v1/transactions/${transaction.id}`, transactionData);
        onEditTransaction(response.data.data);
        setSuccessMessage('Transação editada com sucesso!');
      } else {
        const response = await api.post('/v1/transactions', transactionData);
        onAddTransaction(response.data.data);
        setSuccessMessage('Transação adicionada com sucesso!');
      }

      setShowSuccessModal(true);
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('1');
      setCategoryId('');
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Erro ao salvar transação. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {transaction ? 'Editar Transação' : 'Adicionar Transação'}
              </h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                <X size={20} className="text-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                <NumericFormat
                  value={amount}
                  onValueChange={(values) => setAmount(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  disabled={loading}
                >
                  <option value="1">Receita</option>
                  <option value="2">Despesa</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  disabled={loading}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Salvando...
                    </>
                  ) : transaction ? 'Editar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessClose} 
        message={successMessage}
      />
    </>
  );
};

export default AddTransactionModal;