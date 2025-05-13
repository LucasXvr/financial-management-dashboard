import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import AddTransactionModal from '../components/addTransactionModal';
import DeleteConfirmationModal from '../components/deleteConfirmationModal';
import DeleteSuccessModal from '../components/deleteSuccessModal';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategory = async (categoryId) => {
    try {
      const response = await api.get(`/v1/categories/${categoryId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/v1/transactions', {
        params: {
          pageNumber: 1,
          pageSize: 25,
          startDate,
          endDate,          
        }
      });
      const fetchedTransactions = response.data.data;

      const transactionsWithCategories = await Promise.all(fetchedTransactions.map(async (transaction) => {
        if (transaction.categoryId) {
          const category = await fetchCategory(transaction.categoryId);
          return { ...transaction, category };
        }
        return transaction;
      }));

      setTransactions(transactionsWithCategories);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao carregar transações. Por favor, tente novamente.');
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || transaction.category?.title === categoryFilter)
  );

  const handleAddTransaction = async (newTransaction) => {
    try {
      const category = newTransaction.categoryId ? await fetchCategory(newTransaction.categoryId) : null;
      const transactionWithCategory = { ...newTransaction, category };
      setTransactions(prevTransactions => [transactionWithCategory, ...prevTransactions]);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      setError('Erro ao adicionar transação. Por favor, tente novamente.');
    }
  };

  const handleEditTransaction = async (updatedTransaction) => {
    try {
      const category = updatedTransaction.categoryId ? await fetchCategory(updatedTransaction.categoryId) : null;
      const transactionWithCategory = { ...updatedTransaction, category };
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === updatedTransaction.id ? transactionWithCategory : transaction
        )
      );
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      setError('Erro ao editar transação. Por favor, tente novamente.');
    }
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/v1/transactions/${transactionToDelete.id}`);
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      setError(null);
      setDeleteModalOpen(false);
      setDeleteSuccessModalOpen(true);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao excluir transação. Por favor, tente novamente.');
      }
    } finally {
      setDeleteLoading(false);
      setTransactionToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Transações
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Pesquisar transações..."
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
          <input 
            type="date"
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />

          <button 
            onClick={fetchTransactions} 
            className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors">
            Filtrar
          </button>

          <button
            className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
            onClick={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
          >
            <Plus size={20} className="mr-2" />                                       
            Adicionar
          </button>

          <button
            onClick={() => navigate('/categories')}
            className="flex-grow sm:flex-grow-0 bg-green-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 dark:hover:bg-blue-600 transition-colors"
          >
            Gerenciar Categorias
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(transaction.paidOrReceivedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {transaction.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category?.title || "Sem categoria"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                  {transaction.amount > 0 ? '+' : '-'} R$ {Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex gap-2">
                  <div className="flex space-x-3">
                    <button
                      variant="outline"
                      size="icon"
                      className="p-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200 dark:bg-blue-100 dark:text-blue-600 dark:hover:bg-blue-200 transition-colors"
                      onClick={() => handleOpenEditModal(transaction)}
                      aria-label="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      variant="outline"
                      size="icon"
                      className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-200 transition-colors"
                      onClick={() => handleDeleteClick(transaction)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transaction={editingTransaction}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={transactionToDelete?.title}
        loading={deleteLoading}
      />

      <DeleteSuccessModal
        isOpen={deleteSuccessModalOpen}
        onClose={() => setDeleteSuccessModalOpen(false)}
        title={transactionToDelete?.title}
      />
    </div>
  );
};

export default Transactions;