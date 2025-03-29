import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import AddTransactionModal from '../components/addTransactionModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchCategory = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5110/v1/categories/${categoryId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5110/v1/transactions', {
        params: {
          pageNumber: 1,
          pageSize: 25,
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
      
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || transaction.category?.title === categoryFilter)
  );

  const handleAddTransaction = async (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
    await fetchTransactions();
  };

  const handleEditTransaction = async (updatedTransaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
    await fetchTransactions();
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDelete = async (transactionId) => {
    try {
      // Envia a requisição DELETE para o backend
      await axios.delete(`http://localhost:5110/v1/transactions/${transactionId}`);
      
      // Remove a transação da lista local após excluir no servidor
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== transactionId)
      );
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
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

        <div className="flex gap-4">
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
                      onClick={() => handleDelete(transaction.id)}
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
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;