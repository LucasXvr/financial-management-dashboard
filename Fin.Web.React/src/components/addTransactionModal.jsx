import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { NumericFormat } from "react-number-format";

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction, transaction, onEditTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(1); 
  const [totalPages, setTotalPages] = useState(0);

  const loadCategories = async (page = 1) => {
    try {
      const response = await axios.get(`http://localhost:5110/v1/categories`, {
        params: {
          pageNumber: page,
          pageSize: 25
        }
      });
      setCategories(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  };

  useEffect(() => {
    loadCategories(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setDescription(transaction.title);
        setAmount(transaction.amount);
        setDate(transaction.paidOrReceivedAt?.split('T')[0] || '');
        setType(transaction.type?.toString() || '1');
        setCategoryId(transaction.categoryId?.toString() || '');
      } else {
        setDescription('');
        setAmount('');
        setDate('');
        setType('1');
        setCategoryId('');
      }
    }
  }, [isOpen, transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !date) return;

    setLoading(true);
    try {
      const formattedDate = new Date(date).toISOString();
      const transactionData = {
        title: description,
        type: parseInt(type, 10),
        amount: parseFloat(amount) || 0,
        categoryId: parseInt(categoryId, 10) || 0,
        paidOrReceivedAt: formattedDate,
      };

      if (transaction) {
        const response = await axios.put(`http://localhost:5110/v1/transactions/${transaction.id}`, transactionData);
        onEditTransaction(response.data);
      } else {
        const response = await axios.post('http://localhost:5110/v1/transactions', {
          ...transactionData,
          userId: '123',
        });
        onAddTransaction(response.data);
      }

      onClose();
    } catch (error) {
      if (error.response) {
        console.error('Erro ao salvar transação:', error.response.data);
        alert(`Erro: ${error.response.data.message || 'Erro ao salvar transação'}`);
      } else {
        console.error('Erro desconhecido:', error);
        alert('Erro desconhecido ao salvar transação');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{transaction ? 'Editar Transação' : 'Adicionar Transação'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor
            </label>
            <NumericFormat              
              id="amount"
              value={amount}
              onValueChange={(values) => setAmount(values.value)}
              thousandSeparator={"."}
              decimalSeparator={","}
              prefix={"R$ "}
              fixedDecimalScale={true}
              decimalScale={2}
              allowNegative={false}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            >
              <option value="1">Receita</option>
              <option value="2">Despesa</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
            >
              {loading ? 'Salvando...' : transaction ? 'Editar' : 'Adicionar'}
            </button>
          </div>
        </form>   
      </div>
    </div>
  );
};

export default AddTransactionModal;